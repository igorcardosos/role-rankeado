'use client';

import { useRouter } from 'next/navigation';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

export default function DeleteSessaoButton({ id, label }: { id: number; label: string }) {
  const router = useRouter();
  const { loading, run } = useSubmitGuard();

  function handleClick() {
    if (!window.confirm(`Excluir a sessão "${label}"? As avaliações dela saem do ranking. Não dá pra desfazer.`)) {
      return;
    }
    run(async () => {
      await fetch(`/api/sessoes/${id}`, { method: 'DELETE' });
      router.refresh();
    });
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
