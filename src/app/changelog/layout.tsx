import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Changelog',
    description: 'View the latest updates, new features, and release notes for the ColorWall desktop app.',
    alternates: {
        canonical: 'https://www.colorwall.xyz/changelog',
    },
    openGraph: {
        title: 'ColorWall Changelog & Updates',
        description: 'View the latest updates, new features, and release notes for the ColorWall desktop app.',
        url: 'https://www.colorwall.xyz/changelog',
    }
};

export default function ChangelogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
