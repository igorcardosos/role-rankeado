'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteSessaoButton({ id, label }: { id: number; label: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm(`Excluir a sessão "${label}"? As avaliações dela saem do ranking. Não dá pra desfazer.`)) {
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/sessoes/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-red-500 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 disabled:opacity-50"
    >
      {loading ? 'Excluindo…' : 'Excluir'}
    </button>
  );
}
