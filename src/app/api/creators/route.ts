import { NextResponse } from "next/server";
import { getCreatorStats } from "@/lib/creators";

// public endpoint returning aggregate creator waitlist count and recent claimed handles
export async function GET() {
    try {
        const stats = await getCreatorStats(8);
        return NextResponse.json({
            success: true,
            totalReserved: stats.totalReserved,
            recent: stats.recent,
        });
    } catch (error) {
        console.error("api/creators GET error:", error);
        return NextResponse.json(
            { success: false, error: "Unable to load creator stats." },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
