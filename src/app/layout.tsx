import type { Metadata } from 'next';
import './globals.css';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { SiteNavButtons } from '@/components/SiteNavButtons';
import { themeInitScript } from '@/lib/theme';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { default: 'PRISMFLAGS', template: '%s | PRISMFLAGS' },
  description: 'CLI引数一般化事典 — 1つのフラグが、ツールによってどう変わるか。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-5 py-3 border-b border-theme sticky top-0 bg-surface z-10">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-lg">🚩</span>
            <span className="font-bold tracking-wide text-sm text-primary">
              <span className="text-purple">PRISM</span>FLAGS
              <sup className="text-purple-light text-[7px] ml-0.5">β</sup>
            </span>
          </Link>
          <ThemeSwitcher />
        </header>

        <main className="flex-1">
          {children}
        </main>

        <SiteNavButtons />
      </body>
    </html>
  );
}
