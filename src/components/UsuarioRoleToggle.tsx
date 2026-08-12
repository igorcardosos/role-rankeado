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
        papel === 'ADMIN' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {papel}
    </button>
  );
}
