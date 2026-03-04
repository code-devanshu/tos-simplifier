import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import { Shield, History } from 'lucide-react';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tos-simplifier.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ToS Simplifier — Understand Any Privacy Policy in Seconds",
    template: "%s | ToS Simplifier",
  },
  description:
    "Paste any Terms of Service or Privacy Policy URL and get an instant plain-English breakdown — red flags highlighted, severity-rated, free. No account needed.",
  keywords: [
    "terms of service analyzer",
    "privacy policy reader",
    "ToS simplifier",
    "privacy policy summary",
    "terms of service explainer",
    "AI legal document analyzer",
    "privacy policy checker",
    "understand privacy policy",
    "terms of service summary",
    "legal document simplifier",
    "privacy policy red flags",
    "terms of service summarizer",
  ],
  authors: [{ name: "ToS Simplifier" }],
  creator: "ToS Simplifier",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ToS Simplifier",
    title: "ToS Simplifier — Understand Any Privacy Policy in Seconds",
    description:
      "Paste any Terms of Service or Privacy Policy URL. Get instant plain-English red flag analysis — free, no account needed.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ToS Simplifier" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ToS Simplifier — Understand Any Privacy Policy in Seconds",
    description:
      "Paste any Terms of Service or Privacy Policy URL. Get instant plain-English red flag analysis — free.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-bold hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold">ToS Simplifier</span>
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/history"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm transition-all duration-150"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
              <ApiKeyModal />
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="pt-14 min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 mt-20 py-8 text-center text-slate-600 text-xs">
          <p>
            ToS Simplifier uses AI — always verify important decisions with a professional. Not legal
            advice.
          </p>
        </footer>
      </body>
    </html>
  );
}
