import type { Metadata, Viewport } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import OpenSessionBanner from '@/components/OpenSessionBanner';
import { getAppConfig } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  const { nomeApp } = await getAppConfig();
  return {
    title: nomeApp,
    description: `Ranking dos rolês do grupo — ${nomeApp}`,
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// Aplica o tema antes da primeira pintura da página, pra não piscar
// claro->escuro quando o usuário já tinha escolhido escuro.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
        <NavBar />
        <OpenSessionBanner />
        <main className="max-w-2xl mx-auto px-4 py-4 pb-24">{children}</main>
      </body>
    </html>
  );
}
