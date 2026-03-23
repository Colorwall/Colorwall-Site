import { FeedbackClientDisplay } from '../components/FeedbackClientDisplay';

export const dynamic   = 'force-dynamic';
export const revalidate = 60;

export default function FeedbackPage() {
    // Empty array forces FeedbackClientDisplay to fetch on mount, making page load instant
    return <FeedbackClientDisplay feedbacks={[]} />;
}