import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Download',
    description: 'Download the ColorWall app for Windows 10/11. Experience 8K live wallpapers, native desktop widgets, and taskbar customization with near-zero CPU overhead.',
    alternates: {
        canonical: 'https://www.colorwall.xyz/download',
    },
    openGraph: {
        title: 'Download ColorWall',
        description: 'Download the ColorWall app for Windows 10/11. Experience 8K live wallpapers, native desktop widgets, and taskbar customization with near-zero CPU overhead.',
        url: 'https://www.colorwall.xyz/download',
    }
};

export default function DownloadLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
