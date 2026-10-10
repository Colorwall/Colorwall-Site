import { NextResponse } from "next/server";
import { enrollBetaTester, decryptEmail } from "@/app/actions/beta";
// re-export decrypt helper for server background workers or release notification scripts
export { decryptEmail };
// route handler delegates directly to server
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await enrollBetaTester(body?.email);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error || "Unable to join beta." },
                { status: 400 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("api route beta error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error. Please try again." },
            { status: 500 }
        );
    }
}
