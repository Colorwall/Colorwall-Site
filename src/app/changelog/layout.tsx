import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Changelog',
    description: 'View the latest updates, new features, and release notes for the ColorWall desktop app.',
};

export default function ChangelogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
