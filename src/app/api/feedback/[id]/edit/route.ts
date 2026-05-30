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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
        const bodyData = await req.json();
        const { text: rawText, originalText, adminName } = bodyData;

        if (typeof rawText !== 'string') {
            return NextResponse.json({ success: false, error: 'Invalid text payload.' }, { status: 400 });
        }

        // Append edit tag
        const editTag = `\n\n_Edited by Moderator ${adminName || ''} <3_`.trim();
        // Prevent stacking edit tags
        const text = rawText.includes('_Edited by Moderator') 
            ? rawText 
            : `${rawText}\n\n${editTag}`;

        // We need to fetch the existing body so we don't lose the META_START block, images, etc.
        let apiUrl = type === 'reply' 
            ? `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/comments/${id}`
            : `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${id}`;
            
        const getRes = await fetch(apiUrl, {
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!getRes.ok) return NextResponse.json({ success: false, error: 'Failed to fetch original item.' }, { status: getRes.status });
        
        const existingItem = await getRes.json();
        let newBody = existingItem.body || '';

        // If it's the main issue, it has META block, attached images, logs, etc.
        // We only want to replace the user's text part.
        // originalText contains the parsed text without the META block.
        // We can just replace originalText with newText in the full body.
        
        if (originalText && newBody.includes(originalText)) {
             newBody = newBody.replace(originalText, text);
        } else {
             // Fallback if exact match fails: just overwrite the whole body, but we risk losing meta block!
             // Let's try to extract META block and append it to new text.
             const metaMatch = newBody.match(/<!--\s*META_START[\s\S]*?META_END\s*-->/);
             const imagesMatch = newBody.match(/### Attached Images[\s\S]*/);
             const logsMatch = newBody.match(/### Logs[\s\S]*/);
             
             let reconstructed = text;
             if (imagesMatch) reconstructed += `\n\n${imagesMatch[0]}`;
             if (logsMatch) reconstructed += `\n\n${logsMatch[0]}`;
             if (metaMatch) reconstructed += `\n\n${metaMatch[0]}`;
             
             newBody = reconstructed;
        }

        const patchRes = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ body: newBody })
        });
        
        if (patchRes.ok) {
            return NextResponse.json({ success: true });
        }
        
        return NextResponse.json({ success: false, error: 'Failed to update item.' }, { status: patchRes.status });
    } catch (error) {
        console.error('[feedback/edit/PATCH]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
