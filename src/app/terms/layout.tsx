import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of service for the ColorWall desktop application and website.',
    alternates: {
        canonical: 'https://www.colorwall.xyz/terms',
    },
    openGraph: {
        title: 'ColorWall - Terms of Service',
        description: 'Terms of service for the ColorWall desktop application and website.',
        url: 'https://www.colorwall.xyz/terms',
    }
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
}
