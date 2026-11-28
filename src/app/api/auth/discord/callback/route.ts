import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    OAUTH_STATE_COOKIE_NAME,
    getRequestOrigin,
    sanitizeReturnTo,
    setSessionCookie,
    signAppHandoffToken,
    verifyToken,
} from "@/lib/auth";

interface OAuthStatePayload {
    nonce: string;
    returnTo: string;
    from: "app" | "web";
    exp: number;
}

// verifies discord oauth2 callback, sets httponly session cookie, and optionally hands off to tauri app
export async function GET(req: Request) {
    const origin = getRequestOrigin(req);
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateToken = searchParams.get("state");
    const oauthError = searchParams.get("error");

    const cookieStore = await cookies();
    const expectedNonce = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value;

    cookieStore.set(OAUTH_STATE_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    if (oauthError) {
        return NextResponse.redirect(`${origin}/login?error=oauth_cancelled`);
    }

    if (!code || !stateToken || !expectedNonce) {
        return NextResponse.redirect(`${origin}/login?error=invalid_state`);
    }

    const stateData = verifyToken<OAuthStatePayload>(stateToken);
    if (!stateData || !stateData.nonce) {
        return NextResponse.redirect(`${origin}/login?error=invalid_state`);
    }

    const a = Buffer.from(stateData.nonce);
    const b = Buffer.from(expectedNonce);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return NextResponse.redirect(`${origin}/login?error=invalid_state`);
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${origin}/login?error=missing_discord_config`);
    }

    try {
        const redirectUri = `${origin}/api/auth/discord/callback`;
        const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
            }),
        });

        const tokenJson = await tokenRes.json();
        if (!tokenRes.ok || !tokenJson.access_token) {
            return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`);
        }

        const profileRes = await fetch("https://discord.com/api/users/@me", {
            headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        });

        const profile = await profileRes.json();
        if (!profileRes.ok || !profile.id) {
            return NextResponse.redirect(`${origin}/login?error=profile_fetch_failed`);
        }

        if (!profile.email) {
            return NextResponse.redirect(`${origin}/login?error=discord_no_email`);
        }

        const email = String(profile.email).trim().toLowerCase();
        const uid = `discord_${crypto.createHash("sha256").update(String(profile.id)).digest("hex").slice(0, 16)}`;
        const avatar = profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=128`
            : "";

        const userPayload = {
            uid,
            email,
            name: String(profile.global_name || profile.username || email.split("@")[0]).slice(0, 64),
            avatar,
            provider: "discord" as const,
        };

        if (process.env.MONGODB_URI) {
            try {
                const { MongoClient } = await import("mongodb");
                const client = new MongoClient(process.env.MONGODB_URI, {
                    serverSelectionTimeoutMS: 2500,
                    connectTimeoutMS: 2500,
                });
                await client.connect();
                const emailHash = crypto.createHash("sha256").update(email).digest("hex");
                await client.db("ColorWall").collection("users").updateOne(
                    { uid },
                    {
                        $set: {
                            uid,
                            emailHash,
                            name: userPayload.name,
                            avatar: userPayload.avatar,
                            provider: "discord",
                            lastLoginAt: new Date().toISOString(),
                        },
                        $setOnInsert: { createdAt: new Date().toISOString() },
                    },
                    { upsert: true }
                );
                await client.close();
            } catch (dbErr) {
                console.warn("mongodb discord user upsert warning:", (dbErr as Error).message);
            }
        }

        await setSessionCookie(userPayload);

        if (stateData.from === "app") {
            const handoffToken = signAppHandoffToken(userPayload);
            return NextResponse.redirect(`colorwall://auth?token=${encodeURIComponent(handoffToken)}`);
        }

        const safeReturn = sanitizeReturnTo(stateData.returnTo, "/creators");
        return NextResponse.redirect(`${origin}${safeReturn}`);
    } catch (err) {
        console.error("discord oauth callback error:", err);
        return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
    }
}
