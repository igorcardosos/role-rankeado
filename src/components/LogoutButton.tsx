'use client';

import { useRouter } from 'next/navigation';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

export default function LogoutButton() {
  const router = useRouter();
  const { loading, run } = useSubmitGuard();

  function handleLogout() {
    run(async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 active:text-gray-900 dark:active:text-gray-100 disabled:opacity-50"
    >
      {loading ? 'Saindo…' : 'Sair'}
    </button>
  );
}
