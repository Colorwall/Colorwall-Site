import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "cw_session";
export const OAUTH_STATE_COOKIE_NAME = "cw_oauth_state";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
    uid: string;
    email: string;
    name: string;
    avatar: string;
    provider: "google" | "discord";
    exp: number;
}

function getSigningSecret(): string {
    const secret = process.env.ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("fatal runtime security error: ENCRYPTION_SECRET must be set in production.");
        }
        return "colorwall-dev-local-offline-secret-seed";
    }
    return secret;
}

function base64UrlEncode(input: Buffer | string): string {
    return Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function base64UrlDecode(input: string): Buffer {
    const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
    return Buffer.from(padded, "base64");
}

// sign payload with hmac-sha256 so session tokens cannot be forged by clients
export function signToken(payload: object): string {
    const encoded = base64UrlEncode(JSON.stringify(payload));
    const sig = crypto.createHmac("sha256", getSigningSecret()).update(encoded).digest();
    return `${encoded}.${base64UrlEncode(sig)}`;
}

// verify hmac signature in constant time and decode payload if unexpired
export function verifyToken<T extends { exp?: number }>(token: string): T | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 2) return null;
        const [encoded, sigB64] = parts;

        const expectedSig = crypto.createHmac("sha256", getSigningSecret()).update(encoded).digest();
        const actualSig = base64UrlDecode(sigB64);

        if (expectedSig.length !== actualSig.length) return null;
        if (!crypto.timingSafeEqual(expectedSig, actualSig)) return null;

        const decoded = JSON.parse(base64UrlDecode(encoded).toString("utf8")) as T;
        if (decoded.exp && Date.now() > decoded.exp) {
            return null;
        }
        return decoded;
    } catch {
        return null;
    }
}

// issue httponly session cookie immune to document.cookie xss or extension reads
export async function setSessionCookie(user: Omit<SessionUser, "exp">): Promise<string> {
    const session: SessionUser = {
        ...user,
        exp: Date.now() + SESSION_TTL_SECONDS * 1000,
    };
    const token = signToken(session);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
    });

    return token;
}

// read and verify current user session exclusively on the server
export async function getSessionUser(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
        if (!token) return null;
        return verifyToken<SessionUser>(token);
    } catch {
        return null;
    }
}

export async function clearSessionCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}

// short-lived signed token for colorwall:// deep-link handoff into the tauri desktop app
export function signAppHandoffToken(user: Omit<SessionUser, "exp">): string {
    return signToken({
        ...user,
        purpose: "app_handoff",
        exp: Date.now() + 5 * 60 * 1000,
    });
}

// prevent open redirects by allowing only relative app paths
export function sanitizeReturnTo(raw: string | null | undefined, fallback = "/creators"): string {
    if (!raw || typeof raw !== "string") return fallback;
    const trimmed = raw.trim();
    if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
        return fallback;
    }
    return trimmed;
}

export function getRequestOrigin(req: Request): string {
    const url = new URL(req.url);
    const forwardedHost = req.headers.get("x-forwarded-host");
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    if (forwardedHost) {
        return `${forwardedProto}://${forwardedHost}`;
    }
    return url.origin;
}
