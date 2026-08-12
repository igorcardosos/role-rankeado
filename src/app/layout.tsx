import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import OpenSessionBanner from '@/components/OpenSessionBanner';

export const metadata: Metadata = {
  title: 'Rolê Rankeado',
  description: 'Ranking dos rolês do grupo',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <NavBar />
        <OpenSessionBanner />
        <main className="max-w-2xl mx-auto px-4 py-4 pb-24">{children}</main>
      </body>
    </html>
  );
}
