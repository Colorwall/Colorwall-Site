import { NextResponse } from "next/server";
import { getSessionUser, setSessionCookie } from "@/lib/auth";
import { getCreatorByEmail } from "@/lib/creators";

// returns current verified user from httponly cookie with zero db hits once creatorHandle is cached in session
export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ authenticated: false, user: null });
    }

    let creatorHandle = user.creatorHandle || null;

    // only check redis/mongodb if session cookie does not yet have a claimed handle
    if (!creatorHandle) {
        const existingCreator = await getCreatorByEmail(user.email);
        if (existingCreator?.handle) {
            creatorHandle = existingCreator.handle;
            await setSessionCookie({
                uid: user.uid,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                provider: user.provider,
                creatorHandle,
            });
        }
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            uid: user.uid,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            provider: user.provider,
            creatorHandle,
        },
    });
}
