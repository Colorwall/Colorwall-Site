import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

// revokes httponly cw_session cookie on sign out
export async function POST() {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
}
