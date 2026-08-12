'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SliderInput from '@/components/SliderInput';
import StarRatingInput from '@/components/StarRatingInput';
import { MAX_NOTA_PEIXE, MAX_NOTA_MOLHO, MAX_NOTA_ACOMPANHAMENTO } from '@/lib/constants';

const initialState = {
  notaPeixe: Math.round(MAX_NOTA_PEIXE / 2),
  notaMolho: Math.round(MAX_NOTA_MOLHO / 2),
  notaAcompanhamento: Math.round(MAX_NOTA_ACOMPANHAMENTO / 2),
  estrelaBemServido: 3,
  estrelaAtendimento: 3,
  estrelaLimpeza: 3,
};

export default function AvaliacaoForm({ sessaoId }: { sessaoId: number }) {
  const router = useRouter();
  const [values, setValues] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof initialState>(key: K, value: number) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/sessoes/${sessaoId}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível enviar sua avaliação.');
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <SliderInput
          label="Peixe"
          icon="🐟"
          max={MAX_NOTA_PEIXE}
          value={values.notaPeixe}
          onChange={(v) => set('notaPeixe', v)}
        />
        <SliderInput
          label="Molho"
          icon="🥣"
          max={MAX_NOTA_MOLHO}
          value={values.notaMolho}
          onChange={(v) => set('notaMolho', v)}
        />
        <SliderInput
          label="Acompanhamento"
          icon="🍟"
          max={MAX_NOTA_ACOMPANHAMENTO}
          value={values.notaAcompanhamento}
          onChange={(v) => set('notaAcompanhamento', v)}
        />
      </div>

      <div className="space-y-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <StarRatingInput
          label="Bem servido"
          value={values.estrelaBemServido}
          onChange={(v) => set('estrelaBemServido', v)}
        />
        <StarRatingInput
          label="Atendimento"
          value={values.estrelaAtendimento}
          onChange={(v) => set('estrelaAtendimento', v)}
        />
        <StarRatingInput
          label="Limpeza"
          value={values.estrelaLimpeza}
          onChange={(v) => set('estrelaLimpeza', v)}
        />
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3.5 text-lg active:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Enviando…' : 'Enviar avaliação'}
      </button>
    </form>
  );
}
