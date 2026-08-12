import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth';
import { getAppConfig } from '@/lib/config';
import LogoutButton from '@/components/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';

export default async function NavBar() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  const { nomeApp } = await getAppConfig();

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/ranking" className="font-bold text-lg text-brand-600 dark:text-brand-400 truncate">
          {nomeApp}
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
            {session.nome}
          </span>
          {session.papel === 'ADMIN' && (
            <Link href="/admin" className="text-sm text-brand-600 dark:text-brand-400 font-medium">
              Admin
            </Link>
          )}
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
