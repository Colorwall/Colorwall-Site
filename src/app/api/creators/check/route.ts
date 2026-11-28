import { NextResponse } from "next/server";
import { checkHandleAvailability } from "@/lib/creators";

// real-time handle availability endpoint shared by web signup and tauri desktop app
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const rawHandle = searchParams.get("handle") || "";
        const result = await checkHandleAvailability(rawHandle);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("api/creators/check GET error:", error);
        return NextResponse.json(
            { success: false, available: false, error: "Unable to check handle right now." },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}
