import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Read the privacy policy for the ColorWall app. We are an open-source, privacy-first desktop engine that keeps your data local.',
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
