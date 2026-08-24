'use client';

import { useRouter } from 'next/navigation';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

export default function DeleteUsuarioButton({ id, nome }: { id: number; nome: string }) {
  const router = useRouter();
  const { loading, run } = useSubmitGuard();

  function handleClick() {
    if (
      !window.confirm(
        `Excluir "${nome}"? Isso apaga as avaliações e votos Feeling dele — as notas dos locais que ele avaliou vão recalcular sem essas notas. Não dá pra desfazer.`
      )
    ) {
      return;
    }
    run(async () => {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error || 'Não foi possível excluir o usuário.');
        return;
      }
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
