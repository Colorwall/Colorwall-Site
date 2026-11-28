import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    OAUTH_STATE_COOKIE_NAME,
    getRequestOrigin,
    sanitizeReturnTo,
    signToken,
} from "@/lib/auth";

// initiates discord oauth2 flow with csrf state bound to an httponly cookie
export async function GET(req: Request) {
    const origin = getRequestOrigin(req);
    const { searchParams } = new URL(req.url);
    const returnTo = sanitizeReturnTo(searchParams.get("returnTo"), "/creators");
    const from = searchParams.get("from") === "app" ? "app" : "web";

    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
        return NextResponse.redirect(`${origin}/login?error=missing_discord_config&returnTo=${encodeURIComponent(returnTo)}`);
    }

    const nonce = crypto.randomBytes(24).toString("hex");
    const statePayload = signToken({
        nonce,
        returnTo,
        from,
        exp: Date.now() + 10 * 60 * 1000,
    });

    const cookieStore = await cookies();
    cookieStore.set(OAUTH_STATE_COOKIE_NAME, nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
    });

    const redirectUri = `${origin}/api/auth/discord/callback`;
    const authUrl = new URL("https://discord.com/api/oauth2/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "identify email");
    authUrl.searchParams.set("state", statePayload);

    return NextResponse.redirect(authUrl.toString());
}
