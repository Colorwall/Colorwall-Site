import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

function checkAdmin(req: Request) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/cw_admin_token=([^;]+)/);
    const passkey = match ? match[1] : null;
    return passkey && passkey === process.env.ADMIN_PASSKEY;
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!checkAdmin(req)) {
        return NextResponse.json({ success: false, error: 'Forbidden: Admin access only.' }, { status: 403 });
    }

    const id = (await params).id;
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'issue'; // 'issue' or 'reply'

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return NextResponse.json({ success: false, error: 'GitHub config missing.' }, { status: 500 });
    }

    try {
        if (type === 'reply') {
            // Delete comment
            const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/comments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });
            if (res.ok) {
                return NextResponse.json({ success: true, message: 'Reply deleted.' });
            }
            return NextResponse.json({ success: false, error: 'Failed to delete reply.' }, { status: res.status });
        } else {
            // "Delete" issue (close it)
            // GitHub REST API doesn't support deleting issues. We will close it instead.
            const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state: 'closed' })
            });
            if (res.ok) {
                return NextResponse.json({ success: true, message: 'Thread closed (deleted).' });
            }
            return NextResponse.json({ success: false, error: 'Failed to delete thread.' }, { status: res.status });
        }
    } catch (error) {
        console.error('[feedback/DELETE]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
