'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUserForm() {
  const router = useRouter();
  const [telefone, setTelefone] = useState('');
  const [nome, setNome] = useState('');
  const [papel, setPapel] = useState<'MEMBRO' | 'ADMIN'>('MEMBRO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone, nome, papel }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível cadastrar o usuário.');
        return;
      }
      setTelefone('');
      setNome('');
      setPapel('MEMBRO');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white rounded-2xl border border-gray-200 p-4">
      <input
        placeholder="Telefone"
        inputMode="tel"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        required
      />
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        required
      />
      <select
        value={papel}
        onChange={(e) => setPapel(e.target.value as 'MEMBRO' | 'ADMIN')}
        className="w-full rounded-xl border border-gray-300 px-4 py-3"
      >
        <option value="MEMBRO">Membro</option>
        <option value="ADMIN">Admin</option>
      </select>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3 active:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Salvando…' : 'Adicionar usuário'}
      </button>
    </form>
  );
}
