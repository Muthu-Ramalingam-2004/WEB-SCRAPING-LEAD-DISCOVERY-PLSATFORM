import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/shared/ToastContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lead Finder AI — Web Scraping & Lead Discovery Platform',
  description:
    'Discover businesses, organizations and public contact information. Create scraping tasks, crawl websites and export verified leads.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-slate-50 font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
