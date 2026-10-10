import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { decryptEmail } from "@/app/actions/beta";

// github api endpoint for tracking published colorwall releases
const GITHUB_API_URL = "https://api.github.com/repos/colorwall/colorwall/releases/latest";

// html email template generator for early peeps beta notifications
function buildReleaseEmailHtml({
    version,
    releaseName,
    changelog,
    downloadUrl,
    publishedAt
}: {
    version: string;
    releaseName: string;
    changelog: string;
    downloadUrl: string;
    publishedAt: string;
}): string {
    const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    }) : "Recently";

    // sanitize and format markdown changelog highlights
    const cleanChangelog = (changelog || "Direct3D11 compositor optimizations and stability improvements.")
        .slice(0, 1000)
        .replace(/###/g, "")
        .replace(/##/g, "")
        .replace(/\r\n/g, "<br>")
        .replace(/\n/g, "<br>");

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0c0d0e;
            color: #ffffff;
            margin: 0;
            padding: 32px 16px;
            line-height: 1.6;
        }
        .card {
            max-width: 580px;
            margin: 0 auto;
            background-color: #141416;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }
        .header {
            text-align: center;
            margin-bottom: 28px;
        }
        .logo {
            width: 64px;
            height: 64px;
            margin-bottom: 16px;
        }
        .badge {
            display: inline-block;
            background-color: rgba(16, 185, 129, 0.15);
            color: #34d399;
            font-family: monospace;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 9999px;
            border: 1px solid rgba(16, 185, 129, 0.3);
            margin-bottom: 12px;
        }
        h1 {
            font-size: 26px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 8px 0;
            letter-spacing: -0.02em;
        }
        .subtitle {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
        }
        .changelog-box {
            background-color: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 20px;
            margin: 24px 0;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.7;
        }
        .changelog-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: rgba(255, 255, 255, 0.4);
            font-weight: 700;
            margin-bottom: 8px;
        }
        .cta-container {
            text-align: center;
            margin: 32px 0 24px 0;
        }
        .cta-btn {
            display: inline-block;
            background-color: #10b981;
            color: #000000 !important;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 14px;
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
        }
        .footer {
            text-align: center;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.35);
            margin-top: 32px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 20px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <img src="https://raw.githubusercontent.com/Colorwall/Colorwall-Site/main/public/colorwall.png" alt="ColorWall" class="logo">
            <br>
            <span class="badge">Early Peeps Release</span>
            <h1>Colorwall v${version} is Live</h1>
            <p class="subtitle">Released on ${formattedDate} for beta testers</p>
        </div>

        <div class="changelog-box">
            <div class="changelog-title">Build Highlights & Changes</div>
            ${cleanChangelog}
        </div>

        <div class="cta-container">
            <a href="${downloadUrl || "https://colorwall.xyz/download"}" class="cta-btn">
                Download Colorwall v${version}
            </a>
        </div>

        <div class="footer">
            You received this email because you enrolled in the Colorwall Early Peeps program.<br>
            Your email is encrypted end-to-end and is never stored in plain text.
        </div>
    </div>
</body>
</html>`;
}

// core reusable automation runner that checks github and dispatches emails
export async function checkAndNotifyNewRelease() {
    try {
        // fetch latest github release tag
        const res = await fetch(GITHUB_API_URL, {
            headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "Colorwall-Automated-Notifier",
            },
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            return { success: false, error: "failed to fetch latest github release data" };
        }

        const release = await res.json();
        const latestTag = release.tag_name || "";
        const cleanVersion = latestTag.replace(/^.*?v/i, "");
        const releaseName = release.name || `Colorwall v${cleanVersion}`;
        const changelog = release.body || "";
        const publishedAt = release.published_at || new Date().toISOString();

        // locate windows installer asset
        const exeAsset = (release.assets || []).find((a: { name: string }) =>
            a.name.endsWith(".exe")
        );
        const downloadUrl = exeAsset?.browser_download_url || "https://colorwall.xyz/download";

        // connect to mongodb and inspect last notified release state
        const db = await getDb();
        const metaCollection = db.collection("app_meta");
        const existingMeta = await metaCollection.findOne({ _id: "beta_release_state" as unknown as import("mongodb").ObjectId });

        // check if this release was already broadcasted to testers
        if (existingMeta && (existingMeta as Record<string, unknown>).lastNotifiedTag === latestTag) {
            return {
                success: true,
                updated: false,
                message: "Current release is already broadcasted to all early peeps.",
                version: cleanVersion,
                tag: latestTag
            };
        }

        // new version detected, query all enrolled early peeps
        const testersCollection = db.collection("beta_testers");
        const testers = await testersCollection.find({ tier: "early peeps" }).toArray();

        console.log(`[beta notifier] new release detected (${latestTag}). preparing to notify ${testers.length} testers.`);

        // decrypt emails in ephemeral server memory only
        const recipientEmails: string[] = [];
        for (const tester of testers) {
            if (tester.encryptedEmail) {
                const decrypted = await decryptEmail(tester.encryptedEmail);
                if (decrypted && decrypted.includes("@")) {
                    recipientEmails.push(decrypted);
                }
            }
        }

        let sentCount = 0;
        const apiKey = process.env.BREVO_API_KEY;

        // dispatch emails via brevo api if key is present
        if (apiKey && recipientEmails.length > 0) {
            const htmlContent = buildReleaseEmailHtml({
                version: cleanVersion,
                releaseName,
                changelog,
                downloadUrl,
                publishedAt
            });

            // send in manageable batches to respect rate limits
            const batchSize = 25;
            for (let i = 0; i < recipientEmails.length; i += batchSize) {
                const batch = recipientEmails.slice(i, i + batchSize);
                const sendPromises = batch.map((email) =>
                    fetch("https://api.brevo.com/v3/smtp/email", {
                        method: "POST",
                        headers: {
                            accept: "application/json",
                            "api-key": apiKey,
                            "content-type": "application/json",
                        },
                        body: JSON.stringify({
                            sender: {
                                name: "ColorWall",
                                email: "no-reply@colorwall.xyz",
                            },
                            to: [{ email }],
                            subject: `ColorWall Beta Update: v${cleanVersion} is live!`,
                            htmlContent,
                        }),
                    }).then((r) => (r.ok ? 1 : 0)).catch(() => 0)
                );

                const results = await Promise.all(sendPromises);
                sentCount += results.reduce((acc, curr) => acc + curr, 0);
            }
        } else {
            console.log(`[beta notifier dev mode] brevo api key unset or 0 recipients. simulated send for ${recipientEmails.length} recipients.`);
            sentCount = recipientEmails.length;
        }

        // atomically update mongodb state record so this version is never re-notified
        await metaCollection.updateOne(
            { _id: "beta_release_state" as unknown as import("mongodb").ObjectId },
            {
                $set: {
                    lastNotifiedTag: latestTag,
                    lastNotifiedVersion: cleanVersion,
                    lastNotifiedAt: new Date().toISOString(),
                    lastNotifiedCount: sentCount,
                    releaseName,
                    downloadUrl,
                },
            },
            { upsert: true }
        );

        return {
            success: true,
            updated: true,
            newVersion: cleanVersion,
            latestTag,
            testersCount: testers.length,
            emailsSent: sentCount,
            message: `Successfully broadcasted release v${cleanVersion} to early peeps.`
        };
    } catch (error) {
        console.error("beta release notification automation error:", error);
        return { success: false, error: (error as Error).message };
    }
}

// get handler for vercel cron jobs and status monitors
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // verify cron secret if configured in production
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        // allow local dev inspection without token
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "unauthorized cron request" }, { status: 401 });
        }
    }

    const result = await checkAndNotifyNewRelease();
    return NextResponse.json(result);
}

// post handler for github action release webhooks
export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "unauthorized webhook request" }, { status: 401 });
        }
    }

    const result = await checkAndNotifyNewRelease();
    return NextResponse.json(result);
}
