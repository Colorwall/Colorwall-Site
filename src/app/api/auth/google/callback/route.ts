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

// verifies google oauth2 callback, sets httponly session cookie, and optionally hands off to tauri app
export async function GET(req: Request) {
    const origin = getRequestOrigin(req);
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateToken = searchParams.get("state");
    const oauthError = searchParams.get("error");

    const cookieStore = await cookies();
    const expectedNonce = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value;

    // clear state cookie immediately after reading
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

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${origin}/login?error=missing_google_config`);
    }

    try {
        const redirectUri = `${origin}/api/auth/google/callback`;
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokenJson = await tokenRes.json();
        if (!tokenRes.ok || !tokenJson.access_token) {
            return NextResponse.redirect(`${origin}/login?error=token_exchange_failed`);
        }

        const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: { Authorization: `Bearer ${tokenJson.access_token}` },
        });

        const profile = await profileRes.json();
        if (!profileRes.ok || !profile.email) {
            return NextResponse.redirect(`${origin}/login?error=profile_fetch_failed`);
        }

        const email = String(profile.email).trim().toLowerCase();
        const uid = `google_${crypto.createHash("sha256").update(String(profile.sub || email)).digest("hex").slice(0, 16)}`;
        const userPayload = {
            uid,
            email,
            name: String(profile.name || email.split("@")[0]).slice(0, 64),
            avatar: typeof profile.picture === "string" ? profile.picture : "",
            provider: "google" as const,
        };

        // persist user profile metadata in mongodb when available
        if (process.env.MONGODB_URI) {
            try {
                const { MongoClient } = await import("mongodb");
                const client = new MongoClient(process.env.MONGODB_URI);
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
                            provider: "google",
                            lastLoginAt: new Date().toISOString(),
                        },
                        $setOnInsert: { createdAt: new Date().toISOString() },
                    },
                    { upsert: true }
                );
                await client.close();
            } catch (dbErr) {
                console.warn("mongodb user upsert warning:", (dbErr as Error).message);
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
        console.error("google oauth callback error:", err);
        return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
    }
}
