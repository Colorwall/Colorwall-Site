import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: Request) {
    try {
        const db = await getDb();
        const collection = db.collection('page_views');

        // Extract a page identifier or default to "downloads"
        const { searchParams } = new URL(req.url);
        const page = searchParams.get('page') || 'downloads';

        // Increment view count atomically
        const result = await collection.findOneAndUpdate(
            { page },
            { $inc: { count: 1 } },
            { upsert: true, returnDocument: 'after' }
        );

        return NextResponse.json({ views: result?.count || 1 });
    } catch (e) {
        console.error("View increment failed:", e);
        return NextResponse.json({ views: 0 }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const db = await getDb();
        const collection = db.collection('page_views');

        const { searchParams } = new URL(req.url);
        const page = searchParams.get('page') || 'downloads';

        const result = await collection.findOne({ page });
        return NextResponse.json({ views: result?.count || 0 });
    } catch (e) {
        console.error("View fetch failed:", e);
        return NextResponse.json({ views: 0 }, { status: 500 });
    }
}
