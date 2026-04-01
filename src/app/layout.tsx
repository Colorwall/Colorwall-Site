import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { Navbar } from "@/app/components/Navbar";
import { Analytics } from '@vercel/analytics/next';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: 'swap',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  weight: ["300", "400", "500", "600", "700"],
});


const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://laxenta.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ColorWall - Desktop Customization Engine",
    template: "%s | ColorWall"
  },
  description: "ColorWall is a blazing-fast desktop customization engine built in Rust for Windows 10/11. 4K live wallpapers, taskbar effects, and near-zero resource usage.",
  keywords: [
    "wallpaper engine alternative",
    "desktop customization engine",
    "live wallpapers",
    "4k live wallpapers",
    "windows desktop customization",
    "anime wallpapers",
    "desktop customization engine",
    "rust wallpaper app",
    "animated wallpapers windows",
  ],
  authors: [{ name: "ColorWall Team", url: SITE_URL }],
  creator: "ColorWall",
  publisher: "ColorWall",
  applicationName: "ColorWall",
  generator: "Next.js",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'ColorWall',
    title: 'ColorWall — Desktop Customization Engine',
    description: 'A blazing-fast desktop customization engine built in Rust. 4K live wallpapers, taskbar effects, and near-zero resource usage for Windows 10/11.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ColorWall Live Wallpaper Engine',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary',
    site: '@colorwall_xyz',
    creator: '@colorwall_xyz',
    title: 'ColorWall — Desktop Customization Engine',
    description: 'A performance-first desktop customization engine for Windows. 4K live wallpapers with near-zero overhead, built entirely in Rust.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-jakarta overflow-x-hidden`}
      >
        <ThemeProvider>
          <Navbar />
          <div className="relative min-h-screen flex flex-col">
            {/* Background elements for glass effect depth */}
            {/* <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none z-0" /> */}

            <main className="relative flex-1 flex flex-col transition-all duration-300">
              {children}
            </main>
          </div>
          {/* <Analytics /> */}
        </ThemeProvider>
      </body>
    </html>
  );
}