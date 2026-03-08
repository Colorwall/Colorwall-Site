import { NextRequest, NextResponse } from "next/server";

// hardcoded github api url — no user input touches this
const GITHUB_API_URL =
    "https://api.github.com/repos/colorwall/colorwall/releases/latest";

// only allow downloads from this exact domain
const ALLOWED_DOWNLOAD_HOST = "github.com";

// cors headers
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// handle preflight
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    if (request.method !== "GET") {
        return NextResponse.json(
            { error: "method not allowed" },
            { status: 405, headers: corsHeaders }
        );
    }

    try {
        // fetch the latest release metadata from github
        const releaseRes = await fetch(GITHUB_API_URL, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "Colorwall-Site",
            },
            next: { revalidate: 60 },
        });

        if (!releaseRes.ok) {
            return NextResponse.json(
                { error: "failed to fetch release info" },
                { status: 502, headers: corsHeaders }
            );
        }

        const releaseData = await releaseRes.json();

        // find the .exe asset
        const exeAsset = (releaseData.assets || []).find(
            (a: { name: string }) => a.name.endsWith(".exe")
        );

        if (!exeAsset || !exeAsset.browser_download_url) {
            return NextResponse.json(
                { error: "no downloadable binary found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // validate the download url points to github — prevents open redirect
        const downloadUrl = new URL(exeAsset.browser_download_url);
        if (!downloadUrl.hostname.endsWith(ALLOWED_DOWNLOAD_HOST)) {
            return NextResponse.json(
                { error: "invalid download source" },
                { status: 403, headers: corsHeaders }
            );
        }

        // redirect to the github asset directly instead of proxying
        // this saves server bandwidth and lets the client download directly from github
        return NextResponse.redirect(exeAsset.browser_download_url, {
            status: 302,
        });
    } catch {
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
