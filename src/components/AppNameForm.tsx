'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppNameForm({ nomeAtual }: { nomeAtual: string }) {
  const router = useRouter();
  const [nome, setNome] = useState(nomeAtual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSalvo(false);
    if (!nome.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeApp: nome.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível salvar.');
        return;
      }
      setSalvo(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={salvar} className="flex items-center gap-2">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        maxLength={60}
        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-2.5"
      />
      <button
        type="submit"
        disabled={loading || !nome.trim()}
        className="rounded-xl bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 active:bg-brand-700 disabled:opacity-50 shrink-0"
      >
        {loading ? 'Salvando…' : salvo ? 'Salvo ✓' : 'Salvar'}
      </button>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
    </form>
  );
}
