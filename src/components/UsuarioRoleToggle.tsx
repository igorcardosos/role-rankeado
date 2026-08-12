'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsuarioRoleToggle({
  id,
  papel,
}: {
  id: number;
  papel: 'ADMIN' | 'MEMBRO';
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papel: papel === 'ADMIN' ? 'MEMBRO' : 'ADMIN' }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        papel === 'ADMIN'
          ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
      }`}
    >
      {papel}
    </button>
  );
}
