'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SliderInput from '@/components/SliderInput';
import StarRatingInput from '@/components/StarRatingInput';
import AdminLocalForm from '@/components/AdminLocalForm';
import { MAX_NOTA_PEIXE, MAX_NOTA_MOLHO, MAX_NOTA_ACOMPANHAMENTO } from '@/lib/constants';

type Local = { id: number; nome: string; cidade: string; endereco: string | null };
type Usuario = { id: number; nome: string };

type LinhaAvaliacao = {
  usuarioId: number | '';
  notaPeixe: number;
  notaMolho: number;
  notaAcompanhamento: number;
  estrelaBemServido: number;
  estrelaAtendimento: number;
  estrelaLimpeza: number;
};

function novaLinha(): LinhaAvaliacao {
  return {
    usuarioId: '',
    notaPeixe: Math.round(MAX_NOTA_PEIXE / 2),
    notaMolho: Math.round(MAX_NOTA_MOLHO / 2),
    notaAcompanhamento: Math.round(MAX_NOTA_ACOMPANHAMENTO / 2),
    estrelaBemServido: 3,
    estrelaAtendimento: 3,
    estrelaLimpeza: 3,
  };
}

export default function HistoricoSessaoForm({
  locais,
  usuarios,
}: {
  locais: Local[];
  usuarios: Usuario[];
}) {
  const router = useRouter();
  const [locaisList, setLocaisList] = useState(locais);
  const [modoLocal, setModoLocal] = useState<'novo' | 'existente'>('novo');
  const [localCriado, setLocalCriado] = useState<Local | null>(null);
  const [localIdSelecionado, setLocalIdSelecionado] = useState<number | ''>(locais[0]?.id ?? '');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [linhas, setLinhas] = useState<LinhaAvaliacao[]>([novaLinha()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function atualizarLinha(idx: number, patch: Partial<LinhaAvaliacao>) {
    setLinhas((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function removerLinha(idx: number) {
    setLinhas((prev) => prev.filter((_, i) => i !== idx));
  }

  const localId = modoLocal === 'novo' ? localCriado?.id ?? '' : localIdSelecionado;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!localId) {
      setError(
        modoLocal === 'novo' ? 'Cadastre o local antes de salvar a sessão.' : 'Selecione um local.'
      );
      return;
    }
    if (linhas.some((l) => l.usuarioId === '')) {
      setError('Selecione o usuário em cada linha de avaliação.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sessoes/historico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localId,
          data: new Date(data).toISOString(),
          avaliacoes: linhas,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.error || 'Não foi possível cadastrar a sessão histórica.');
        return;
      }
      router.push('/admin');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-medium text-sm">Local</label>
          {locaisList.length > 0 && (
            <button
              type="button"
              onClick={() => setModoLocal(modoLocal === 'novo' ? 'existente' : 'novo')}
              className="text-sm text-brand-600 dark:text-brand-400 font-medium"
            >
              {modoLocal === 'novo'
                ? 'Já fomos lá? Escolher local existente'
                : '+ Cadastrar novo local'}
            </button>
          )}
        </div>

        {modoLocal === 'novo' ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            {localCriado ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{localCriado.nome}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{localCriado.cidade}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalCriado(null)}
                  className="text-sm text-gray-500 dark:text-gray-400"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <AdminLocalForm
                embedded
                onSaved={(novo) => {
                  setLocaisList((prev) => [...prev, novo]);
                  setLocalCriado(novo);
                }}
              />
            )}
          </div>
        ) : (
          <select
            value={localIdSelecionado}
            onChange={(e) => setLocalIdSelecionado(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3"
          >
            {locaisList.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome} — {l.cidade}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="font-medium text-sm block mb-1.5">Data</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4 py-3"
          required
        />
      </div>

      <div className="space-y-4">
        <p className="font-medium text-sm">Avaliações de quem participou</p>
        {linhas.map((linha, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-4"
          >
            <div className="flex items-center gap-2">
              <select
                value={linha.usuarioId}
                onChange={(e) => atualizarLinha(idx, { usuarioId: Number(e.target.value) })}
                className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2.5"
                required
              >
                <option value="">Selecione o usuário</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
              {linhas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removerLinha(idx)}
                  className="text-red-500 dark:text-red-400 text-sm px-2"
                  aria-label="Remover linha"
                >
                  ✕
                </button>
              )}
            </div>

            <SliderInput
              label="Peixe"
              icon="🐟"
              max={MAX_NOTA_PEIXE}
              value={linha.notaPeixe}
              onChange={(v) => atualizarLinha(idx, { notaPeixe: v })}
            />
            <SliderInput
              label="Molho"
              icon="🥣"
              max={MAX_NOTA_MOLHO}
              value={linha.notaMolho}
              onChange={(v) => atualizarLinha(idx, { notaMolho: v })}
            />
            <SliderInput
              label="Acompanhamento"
              icon="🍟"
              max={MAX_NOTA_ACOMPANHAMENTO}
              value={linha.notaAcompanhamento}
              onChange={(v) => atualizarLinha(idx, { notaAcompanhamento: v })}
            />
            <StarRatingInput
              label="Bem servido"
              value={linha.estrelaBemServido}
              onChange={(v) => atualizarLinha(idx, { estrelaBemServido: v })}
            />
            <StarRatingInput
              label="Atendimento"
              value={linha.estrelaAtendimento}
              onChange={(v) => atualizarLinha(idx, { estrelaAtendimento: v })}
            />
            <StarRatingInput
              label="Limpeza"
              value={linha.estrelaLimpeza}
              onChange={(v) => atualizarLinha(idx, { estrelaLimpeza: v })}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => setLinhas((prev) => [...prev, novaLinha()])}
          className="w-full rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-3 text-sm text-gray-500 dark:text-gray-400"
        >
          + Adicionar avaliação de outra pessoa
        </button>
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3.5 text-lg active:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Salvando…' : 'Cadastrar sessão histórica'}
      </button>
    </form>
  );
}
