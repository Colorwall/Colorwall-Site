import { NextResponse } from 'next/server';

// ─── GitHub Config ────────────────────────────────────────────────────────────
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function GET(req: Request) {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return NextResponse.json({ success: true, data: [] });
    }
    try {
        const url = new URL(req.url);
        const deviceId = url.searchParams.get('deviceId') || '';
        const username = url.searchParams.get('username') || '';
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
        const skip = Math.max(0, parseInt(url.searchParams.get('skip') || '0', 10));
        const page = Math.floor(skip / limit) + 1;

        if (!deviceId && !username) {
            return NextResponse.json({ success: false, error: 'Missing identifying parameters.' }, { status: 400 });
        }

        // Search issues by deviceId or username string in the body
        const searchTerms = [];
        if (deviceId) searchTerms.push(`"${deviceId}"`);
        else if (username) searchTerms.push(`"${username}"`);
        
        const q = `repo:${GITHUB_OWNER}/${GITHUB_REPO} is:issue state:open ${searchTerms.join(' OR ')}`;

        const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=${limit}&page=${page}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch issues');
        const data = await res.json();
        const issues = data.items || [];

        const formatted = await Promise.all(issues.map(async (issue: any) => {
            let meta: any = {};
            let text = issue.body || '';
            const metaMatch = text.match(/<!--\s*META_START([\s\S]*?)META_END\s*-->/);
            if (metaMatch) {
                try {
                    meta = JSON.parse(metaMatch[1]);
                } catch(e) {}
                text = text.replace(metaMatch[0], '').trim();
                text = text.replace(/### Images[\s\S]*/, '').trim();
                text = text.replace(/### Logs[\s\S]*/, '').trim();
            }

            const logFiles = [];
            if (meta.logFiles) {
                for (const lf of meta.logFiles) {
                    try {
                        const lfRes = await fetch(lf.url);
                        if (lfRes.ok) {
                            const content = await lfRes.text();
                            logFiles.push({ name: lf.name, content: content.slice(0, 2000) });
                        }
                    } catch(e) {}
                }
            }

            let replies = [];
            if (issue.comments > 0) {
                try {
                    const cRes = await fetch(issue.comments_url, {
                        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
                    });
                    if (cRes.ok) {
                        const commentsData = await cRes.json();
                        replies = commentsData.map((c: any) => {
                            let replyMeta: any = {};
                            let replyText = c.body || '';
                            const rMetaMatch = replyText.match(/<!--\s*META_START([\s\S]*?)META_END\s*-->/);
                            if (rMetaMatch) {
                                try { replyMeta = JSON.parse(rMetaMatch[1]); } catch(e) {}
                                replyText = replyText.replace(rMetaMatch[0], '').trim();
                            }
                            return {
                                id: c.id.toString(),
                                username: replyMeta.username || c.user.login,
                                text: replyText,
                                createdAt: new Date(c.created_at)
                            };
                        });
                    }
                } catch(e) {}
            }

            return {
                id: issue.number.toString(),
                username: meta.username || 'Anonymous',
                text: text,
                images: meta.images || [],
                logFiles,
                appVersion: meta.appVersion,
                source: meta.source || 'Web',
                createdAt: new Date(issue.created_at),
                replies
            };
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('[feedback/me/GET]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
