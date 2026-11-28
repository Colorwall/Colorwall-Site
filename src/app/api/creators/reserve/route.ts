import crypto from "crypto";
import { NextResponse } from "next/server";
import { reserveCreatorHandle } from "@/lib/creators";
import { getSessionUser, setSessionCookie, verifyToken, type SessionUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/redis";

// handle reservation endpoint requiring either a valid web session cookie or a signed app bearer token
export async function POST(req: Request) {
    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
        const allowed = await checkRateLimit(`rl:creators:reserve:${ipHash}`, 8, 60);
        if (!allowed) {
            return NextResponse.json(
                { success: false, error: "Too many attempts. Please wait a minute." },
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
