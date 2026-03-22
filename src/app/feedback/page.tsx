import { getDb } from '@/lib/mongodb';
import { FeedbackClientDisplay } from '../components/FeedbackClientDisplay';

export const dynamic   = 'force-dynamic';
export const revalidate = 60;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeedbackItem {
    id:        string;
    username:  string;
    text:      string;
    images:    string[];
    source:    'App' | 'Web';
    createdAt: Date;
}

interface FeedbackGroup {
    username: string;
    source:   'App' | 'Web';
    items:    FeedbackItem[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getFeedback(): Promise<FeedbackItem[]> {
    try {
        const db   = await getDb();
        const docs = await db.collection('feedback')
            .find()
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray();

        return docs.map(doc => ({
            id:        doc._id.toString(),
            username:  doc.username ?? 'Anonymous',
            text:      doc.text     ?? '',
            images:    doc.images   ?? [],
            source:    (doc.source === 'App' ? 'App' : 'Web') as 'App' | 'Web',
            createdAt: doc.createdAt,
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function FeedbackPage() {
    const feedbacks = await getFeedback();

    return <FeedbackClientDisplay feedbacks={feedbacks as any} />;
}