'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import PhoneInput from '@/components/PhoneInput';
import { useSubmitGuard } from '@/lib/useSubmitGuard';

export default function LoginForm({ nomeApp }: { nomeApp: string }) {
  const router = useRouter();
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { loading, run } = useSubmitGuard();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    run(async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telefone }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível entrar.');
        return;
      }
      router.push('/ranking');
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-brand-600 dark:text-brand-400 mb-1">
          {nomeApp}
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Entre com o número de telefone cadastrado pelo grupo.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PhoneInput
            autoFocus
            placeholder="Ex: (31) 98534-7640"
            value={telefone}
            onChange={setTelefone}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3.5 text-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
          {error && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || telefone.trim().length < 8}
            className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3.5 text-lg active:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
