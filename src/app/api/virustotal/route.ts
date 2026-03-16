import { NextResponse } from "next/server";
import crypto from "crypto";

// cache this route for 1 hour to prevent hitting github/virustotal rate limits
export const revalidate = 3600;

export async function GET() {
    try {
        const VT_API_KEY = "fbc3c83112565aa17273eb4b799ee24a7f2fb96bcb9a589f40f1dec963030503";
        // we no care about the api key, steal it tf u gonna do using a free api key
        // fetch latest github release
        const ghRes = await fetch("https://api.github.com/repos/colorwall/colorwall/releases/latest");
        if (!ghRes.ok) throw new Error("failed to fetch github release");
        const ghData = await ghRes.json();
        
        const exeAsset = ghData.assets?.find((a: any) => a.name.endsWith('.exe'));
        if (!exeAsset) throw new Error("no exe asset found");

        const downloadUrl = exeAsset.browser_download_url;
        
        // download file
        const fileRes = await fetch(downloadUrl);
        if (!fileRes.ok) throw new Error("failed to download exe file");
        
        const fileBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);
        
        // calculate hashes
        const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
        const md5 = crypto.createHash('md5').update(buffer).digest('hex');
        const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');

        // check virustotal report
        const vtGetRes = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, {
            headers: {
                "x-apikey": VT_API_KEY,
                "accept": "application/json"
            }
        });

        if (vtGetRes.ok) {
            const vtData = await vtGetRes.json();
            return NextResponse.json({
                status: "found",
                name: exeAsset.name,
                size: exeAsset.size,
                date: exeAsset.created_at,
                sha256,
                md5,
                sha1,
                stats: vtData.data.attributes.last_analysis_stats,
                link: `https://www.virustotal.com/gui/file/${sha256}?nocache=1`
            });
        }

        // if not found (404), upload to virustotal
        if (vtGetRes.status === 404) {
            const formData = new FormData();
            formData.append("file", new Blob([buffer]), exeAsset.name);

            const vtPostRes = await fetch("https://www.virustotal.com/api/v3/files", {
                method: "POST",
                headers: {
                    "x-apikey": VT_API_KEY,
                    "accept": "application/json"
                },
                body: formData
            });

            if (!vtPostRes.ok) {
                const errorText = await vtPostRes.text();
                throw new Error(`failed to upload to virustotal: ${errorText}`);
            }

            return NextResponse.json({
                status: "uploaded",
                name: exeAsset.name,
                size: exeAsset.size,
                date: exeAsset.created_at,
                sha256,
                md5,
                sha1,
                stats: null, // no stats yet, scanning in progress
                link: `https://www.virustotal.com/gui/file/${sha256}?nocache=1`
            });
        }

        const errorText = await vtGetRes.text();
        throw new Error(`unexpected virustotal response: ${vtGetRes.status} - ${errorText}`);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
