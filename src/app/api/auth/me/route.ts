import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// returns current verified user from httponly cw_session cookie
export async function GET() {
    const user = await getSessionUser();
    if (!user) {
        return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
        authenticated: true,
        user: {
            uid: user.uid,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            provider: user.provider,
        },
    });
}
