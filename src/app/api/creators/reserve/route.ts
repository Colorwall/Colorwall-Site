import crypto from "crypto";
import { NextResponse } from "next/server";
import { reserveCreatorHandle } from "@/lib/creators";
import { getSessionUser, setSessionCookie, verifyToken, type SessionUser } from "@/lib/auth";
import { checkRateLimit, getLifetimeCount, incrementLifetimeCount } from "@/lib/redis";

// permanent cap of 2 successful handle reservations per ip forever (blocks multi-gmail hoarding)
const MAX_CLAIMS_PER_IP_FOREVER = 2;

// handle reservation endpoint requiring verified web cookie or signed app bearer token
// env checklist for vercel: MONGODB_URI, REDIS_URL, ENCRYPTION_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

        // short burst guard (5 attempts/min) + permanent lifetime cap (2 claims per ip forever)
        const burstAllowed = await checkRateLimit(`rl:creators:burst:${ipHash}`, 5, 60);
        if (!burstAllowed) {
            return NextResponse.json(
                { success: false, error: "Too many attempts. Please wait a minute." },
                { status: 429 }
            );
        }

        const lifetimeKey = `claims:ip:${ipHash}`;
        const lifetimeClaims = await getLifetimeCount(lifetimeKey);
        if (lifetimeClaims >= MAX_CLAIMS_PER_IP_FOREVER) {
            return NextResponse.json(
                { success: false, error: "Handle reservation limit reached for this network." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const isAppSource = body?.source === "App";

        let verifiedEmail = "";
        let verifiedName: string | undefined = typeof body?.displayName === "string" ? body.displayName : undefined;
        let sessionUser: SessionUser | null = null;

        if (!isAppSource) {
            sessionUser = await getSessionUser();
            if (!sessionUser) {
                return NextResponse.json(
                    { success: false, error: "Sign in required before reserving a handle." },
                    { status: 401 }
                );
            }
            verifiedEmail = sessionUser.email;
            verifiedName = verifiedName || sessionUser.name;
        } else {
            // require a signed bearer token from colorwall://auth so attackers cannot spoof source=App
            const authHeader = req.headers.get("authorization");
            if (!authHeader?.startsWith("Bearer ")) {
                return NextResponse.json(
                    { success: false, error: "App authentication token required." },
                    { status: 401 }
                );
            }
            const tokenUser = verifyToken<SessionUser>(authHeader.slice(7));
            if (!tokenUser?.email) {
                return NextResponse.json(
                    { success: false, error: "Invalid or expired app token." },
                    { status: 401 }
                );
            }
            verifiedEmail = tokenUser.email;
            verifiedName = verifiedName || tokenUser.name;
        }

        const result = await reserveCreatorHandle({
            handle: body?.handle,
            email: verifiedEmail,
            displayName: verifiedName,
            source: isAppSource ? "App" : "Web",
            deviceId: body?.deviceId,
            portfolioUrl: body?.portfolioUrl,
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || "Unable to reserve handle." },
                { status: result.status || 400 }
            );
        }

        // only consume a lifetime ip slot once the reservation actually succeeds
        await incrementLifetimeCount(lifetimeKey);

        // persist claimed handle inside httponly session cookie so /api/auth/me needs zero db hits
        if (sessionUser && result.creator) {
            await setSessionCookie({
                uid: sessionUser.uid,
                email: sessionUser.email,
                name: sessionUser.name,
                avatar: sessionUser.avatar,
                provider: sessionUser.provider,
                creatorHandle: result.creator.handle,
            });
        }

        return NextResponse.json(
            {
                success: true,
                creator: result.creator,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("api/creators/reserve POST error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error. Please try again." },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
