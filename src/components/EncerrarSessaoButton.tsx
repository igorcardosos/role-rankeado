'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EncerrarSessaoButton({
  sessaoId,
  compact = false,
}: {
  sessaoId: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch(`/api/sessoes/${sessaoId}/encerrar`, { method: 'POST' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-900 text-white disabled:opacity-50"
      >
        {loading ? 'Encerrando…' : 'Encerrar'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-xl bg-gray-900 text-white font-semibold py-3 active:bg-gray-800 disabled:opacity-50"
    >
      {loading ? 'Encerrando…' : 'Encerrar sessão'}
    </button>
  );
}
