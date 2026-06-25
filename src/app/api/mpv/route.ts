import { NextRequest, NextResponse } from "next/server";

// hardcoded github release url for mpv.exe
const GITHUB_API_URL =
    "https://api.github.com/repos/Colorwall/Colorwall-Site/releases/tags/mpv.exe";

// only allow downloads from github
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
        // fetch the mpv.exe release metadata from github
        const releaseRes = await fetch(GITHUB_API_URL, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "Colorwall-Site",
            },
            next: { revalidate: 300 }, // cache for 5 mins
        });

        if (!releaseRes.ok) {
            return NextResponse.json(
                { error: "failed to fetch mpv release info" },
                { status: 502, headers: corsHeaders }
            );
        }

        const releaseData = await releaseRes.json();

        // find the mpv.exe asset
        const exeAsset = (releaseData.assets || []).find(
            (a: { name: string }) => a.name === "mpv.exe"
        );

        if (!exeAsset || !exeAsset.browser_download_url) {
            return NextResponse.json(
                { error: "mpv.exe not found in release" },
                { status: 404, headers: corsHeaders }
            );
        }

        // validate the download url points to github
        const downloadUrl = new URL(exeAsset.browser_download_url);
        const hostname = downloadUrl.hostname;
        const isAllowedHost =
            hostname === ALLOWED_DOWNLOAD_HOST ||
            hostname.endsWith(`.${ALLOWED_DOWNLOAD_HOST}`);
        if (!isAllowedHost) {
            return NextResponse.json(
                { error: "invalid download source" },
                { status: 403, headers: corsHeaders }
            );
        }

        // redirect to github asset directly — saves our bandwidth
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
