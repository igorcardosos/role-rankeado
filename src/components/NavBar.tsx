import Link from 'next/link';
import { getSessionFromCookies } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function NavBar() {
  const session = await getSessionFromCookies();
  if (!session) return null;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/ranking" className="font-bold text-lg text-brand-600">
          Rolê Rankeado
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:inline">{session.nome}</span>
          {session.papel === 'ADMIN' && (
            <Link href="/admin" className="text-sm text-brand-600 font-medium">
              Admin
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
