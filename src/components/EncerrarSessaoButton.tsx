'use client';

import { useRouter } from 'next/navigation';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

export default function EncerrarSessaoButton({
  sessaoId,
  compact = false,
}: {
  sessaoId: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const { loading, run } = useSubmitGuard();

  function handleClick() {
    run(async () => {
      await fetch(`/api/sessoes/${sessaoId}/encerrar`, { method: 'POST' });
      router.refresh();
    });
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
