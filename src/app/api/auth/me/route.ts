import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCreatorByEmail } from "@/lib/creators";

// returns current verified user and their claimed creator handle if onboarded
export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ authenticated: false, user: null });
    }

    const existingCreator = await getCreatorByEmail(user.email);

    return NextResponse.json({
        authenticated: true,
        user: {
            uid: user.uid,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            provider: user.provider,
            creatorHandle: existingCreator?.handle || null,
        },
    });
}
