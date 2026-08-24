'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/PhoneInput';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

export default function AdminUserForm() {
  const router = useRouter();
  const [telefone, setTelefone] = useState('');
  const [nome, setNome] = useState('');
  const [papel, setPapel] = useState<'MEMBRO' | 'ADMIN'>('MEMBRO');
  const [error, setError] = useState<string | null>(null);
  const { loading, run } = useSubmitGuard();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    run(async () => {
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
    });
  }

  const inputClass =
    'w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
    >
      <PhoneInput
        placeholder="Ex: (31) 98534-7640"
        value={telefone}
        onChange={setTelefone}
        className={inputClass}
        required
      />
      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className={inputClass}
        required
      />
      <select
        value={papel}
        onChange={(e) => setPapel(e.target.value as 'MEMBRO' | 'ADMIN')}
        className={inputClass}
      >
        <option value="MEMBRO">Membro</option>
        <option value="ADMIN">Admin</option>
      </select>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
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
