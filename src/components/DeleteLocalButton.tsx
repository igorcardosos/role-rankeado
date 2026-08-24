'use client';

import { useRouter } from 'next/navigation';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

export default function DeleteLocalButton({ id, nome }: { id: number; nome: string }) {
  const router = useRouter();
  const { loading, run } = useSubmitGuard();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Excluir "${nome}"? Isso apaga todas as sessões e avaliações desse local. Não dá pra desfazer.`)) {
      return;
    }
    run(async () => {
      await fetch(`/api/locais/${id}`, { method: 'DELETE' });
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={`Excluir ${nome}`}
      className="text-red-500 text-sm px-2 py-1 disabled:opacity-50"
    >
      {loading ? '…' : '🗑️'}
    </button>
  );
}
