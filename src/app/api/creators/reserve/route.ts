import { NextResponse } from "next/server";
import { reserveCreatorHandle } from "@/lib/creators";
import { getSessionUser, verifyToken, type SessionUser } from "@/lib/auth";

// handle reservation endpoint enforcing verified httponly session on web and supporting app tokens
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const isAppSource = body?.source === "App";

        let verifiedEmail = typeof body?.email === "string" ? body.email : "";
        let verifiedName = typeof body?.displayName === "string" ? body.displayName : undefined;

        if (!isAppSource) {
            const sessionUser = await getSessionUser();
            if (!sessionUser) {
                return NextResponse.json(
                    { success: false, error: "Sign in required before reserving a handle." },
                    { status: 401 }
                );
            }
            verifiedEmail = sessionUser.email;
            verifiedName = verifiedName || sessionUser.name;
        } else {
            // optional bearer token verification when desktop app passes handoff jwt
            const authHeader = req.headers.get("authorization");
            if (authHeader?.startsWith("Bearer ")) {
                const tokenUser = verifyToken<SessionUser>(authHeader.slice(7));
                if (tokenUser?.email) {
                    verifiedEmail = tokenUser.email;
                    verifiedName = verifiedName || tokenUser.name;
                }
            }
        }

        const result = await reserveCreatorHandle({
            handle: body?.handle,
            email: verifiedEmail,
            displayName: verifiedName,
            specialty: body?.specialty,
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
