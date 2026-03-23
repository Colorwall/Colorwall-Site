import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

function hashIp(req: Request): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const raw =
        (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
        req.headers.get('x-real-ip') ||
        'unknown';
    return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const currentIpHash = hashIp(req);
        const db = await getDb();

        // 1. Verify if the requester is "Laxenta"
        // Admin condition: The current IP hash must have at least one feedback post under the exact alias 'laxenta'
        const isAdmin = await db.collection('feedback').findOne({ 
            username: { $regex: /^laxenta$/i }, 
            ipHash: currentIpHash 
        });

        if (!isAdmin) {
            return NextResponse.json({ success: false, error: 'Forbidden: Admin access only.' }, { status: 403 });
        }

        // 2. Try to grab ObjectId (if it is a thread ID)
        let objectId: ObjectId | null = null;
        try {
            objectId = new ObjectId(id);
        } catch {
            // Invalid ObjectId, meaning it's almost certainly a Reply ID (which is also an ObjectId string natively, but just in case)
        }

        // 3. Try to delete as a Main Thread
        if (objectId) {
            const deleteResult = await db.collection('feedback').deleteOne({ _id: objectId });
            if (deleteResult.deletedCount === 1) {
                return NextResponse.json({ success: true, message: 'Thread deleted.' });
            }
        }

        // 4. If not a thread (or invalid ObjectId), try to delete as a Reply
        const pullResult = await db.collection('feedback').updateOne(
            { "replies.id": id },
            { $pull: { replies: { id } } as any }
        );

        if (pullResult.modifiedCount === 1) {
            return NextResponse.json({ success: true, message: 'Reply deleted.' });
        }

        return NextResponse.json({ success: false, error: 'Item not found.' }, { status: 404 });

    } catch (error) {
        console.error('[feedback/DELETE]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
