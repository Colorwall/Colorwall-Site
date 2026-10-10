import { NextRequest, NextResponse } from "next/server";
import { checkAndNotifyNewRelease } from "@/app/api/beta/notify-release/route";

// github api url hardcoded to prevent any injection
const GITHUB_API_URL =
    "https://api.github.com/repos/colorwall/colorwall/releases/latest";

// cors headers applied to every response
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

// handle preflight requests
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    // only allow GET requests — reject anything else
    if (request.method !== "GET") {
        return NextResponse.json(
            { error: "method not allowed" },
            { status: 405, headers: corsHeaders }
        );
    }

    try {
        const res = await fetch(GITHUB_API_URL, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "Colorwall-Site",
            },
            // cache for 60 seconds server-side to avoid github rate limits
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "failed to fetch release data" },
                { status: 502, headers: corsHeaders }
            );
        }

        const data = await res.json();

        // extract only what the tauri app needs without forwarding raw github payload
        // trigger background early peeps notification check asynchronously
        // non-blocking execution ensures instant response for desktop clients
        void checkAndNotifyNewRelease().catch(() => {});

        // tag format is "Colorwall-vX.Y.Z", strip the prefix for a clean semver
        const version = (data.tag_name || "").replace(/^.*?v/i, "");
        const name = data.name || `ColorWall v${version}`;
        const publishedAt = data.published_at || null;
        const changelog = data.body || "";
        const htmlUrl = data.html_url || "";
        const prerelease = data.prerelease || false;

        // find the windows installer asset
        const exeAsset = (data.assets || []).find((a: { name: string }) =>
            a.name.endsWith(".exe")
        );

        const download = exeAsset
            ? {
                url: exeAsset.browser_download_url,
                size: exeAsset.size,
                filename: exeAsset.name,
            }
            : null;

        const payload = {
            version,
            name,
            published_at: publishedAt,
            prerelease,
            changelog,
            download,
            html_url: htmlUrl,
        };

        return NextResponse.json(payload, {
            status: 200,
            headers: {
                ...corsHeaders,
                // let clients cache for 1 minute
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                // prevent sniffing
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch {
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500, headers: corsHeaders }
        );
    }
}
