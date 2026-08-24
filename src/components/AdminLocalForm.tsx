'use client';

import { useState } from 'react';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

type Local = { id: number; nome: string; cidade: string; endereco: string | null };

export default function AdminLocalForm({
  local,
  onSaved,
  embedded = false,
}: {
  local?: Local;
  onSaved?: (local: Local) => void;
  /** Use quando este form já está dentro de outro <form> — evita <form> aninhado (HTML inválido). */
  embedded?: boolean;
}) {
  const [nome, setNome] = useState(local?.nome ?? '');
  const [cidade, setCidade] = useState(local?.cidade ?? '');
  const [endereco, setEndereco] = useState(local?.endereco ?? '');
  const [error, setError] = useState<string | null>(null);
  const { loading, run } = useSubmitGuard();

  function salvar() {
    setError(null);
    if (!nome.trim() || !cidade.trim()) {
      setError('Preencha nome e cidade.');
      return;
    }
    run(async () => {
      const url = local ? `/api/locais/${local.id}` : '/api/locais';
      const res = await fetch(url, {
        method: local ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, cidade, endereco: endereco || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível salvar o local.');
        return;
      }
      const saved = await res.json();
      if (!local) {
        setNome('');
        setCidade('');
        setEndereco('');
      }
      onSaved?.(saved);
    });
  }

  const campos = (
    <>
      <input
        placeholder="Nome do local"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        required={!embedded}
      />
      <input
        placeholder="Cidade"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        required={!embedded}
      />
      <input
        placeholder="Endereço ou link do Google Maps (opcional)"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-3">
        {campos}
        <button
          type="button"
          onClick={salvar}
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3 active:bg-brand-700 disabled:opacity-50"
        >
          {loading ? 'Salvando…' : local ? 'Salvar alterações' : 'Cadastrar local'}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
      className="space-y-3"
    >
      {campos}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3 active:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Salvando…' : local ? 'Salvar alterações' : 'Cadastrar local'}
      </button>
    </form>
  );
}
