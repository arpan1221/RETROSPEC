import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RETROSPEC — AI History Explorer',
  description:
    'A machine-readable, AI-consumable historical repository documenting the complete evolutionary lineage of artificial intelligence — from philosophical roots to the agentic era.',
  openGraph: {
    title: 'RETROSPEC — AI History Explorer',
    description:
      'Explore the complete evolutionary lineage of artificial intelligence on an interactive geographic map.',
    type: 'website',
    locale: 'en_US',
    siteName: 'RETROSPEC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RETROSPEC — AI History Explorer',
    description:
      'Explore the complete evolutionary lineage of artificial intelligence on an interactive geographic map.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} dark`}>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] font-[var(--font-inter)] antialiased">
        {children}
      </body>
    </html>
  );
}
