'use client';

import { useRouter } from 'next/navigation';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

export default function UsuarioRoleToggle({
  id,
  papel,
}: {
  id: number;
  papel: 'ADMIN' | 'MEMBRO';
}) {
  const router = useRouter();
  const { loading, run } = useSubmitGuard();

  function toggle() {
    run(async () => {
      await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papel: papel === 'ADMIN' ? 'MEMBRO' : 'ADMIN' }),
      });
      router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full disabled:opacity-50 ${
        papel === 'ADMIN'
          ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
      }`}
    >
      {loading ? '…' : papel}
    </button>
  );
}
