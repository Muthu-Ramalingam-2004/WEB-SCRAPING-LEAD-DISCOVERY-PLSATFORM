import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/shared/ToastContext';
import { ThemeProvider } from '@/components/shared/ThemeContext';
import { UserProvider } from '@/components/shared/UserContext';

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-150">
        <ThemeProvider>
          <ToastProvider>
            <UserProvider>{children}</UserProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
