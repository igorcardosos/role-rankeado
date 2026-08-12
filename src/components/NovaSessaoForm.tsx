'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUploadField from '@/components/PhotoUploadField';
import AdminLocalForm from '@/components/AdminLocalForm';

type Local = { id: number; nome: string; cidade: string; endereco: string | null };

export default function NovaSessaoForm({ locais }: { locais: Local[] }) {
  const router = useRouter();
  const [locaisList, setLocaisList] = useState(locais);
  // Regra: abrir sessão é, na maioria das vezes, em um lugar novo — então
  // criar local é o padrão. Escolher um local já cadastrado é a exceção.
  const [modo, setModo] = useState<'novo' | 'existente'>('novo');
  const [localCriado, setLocalCriado] = useState<Local | null>(null);
  const [localIdSelecionado, setLocalIdSelecionado] = useState<number | null>(
    locais[0]?.id ?? null
  );
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleLocalCriado(novoLocal: Local) {
    setLocaisList((prev) => [...prev, novoLocal]);
    setLocalCriado(novoLocal);
  }

  const localId = modo === 'novo' ? localCriado?.id ?? null : localIdSelecionado;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!localId) {
      setError(
        modo === 'novo' ? 'Cadastre o local antes de abrir a sessão.' : 'Selecione um local.'
      );
      return;
    }
    if (!foto) {
      setError('A foto do prato é obrigatória.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set('localId', String(localId));
      formData.set('foto', foto);
      const res = await fetch('/api/sessoes', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Não foi possível abrir a sessão.');
        return;
      }
      router.push('/ranking');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-medium text-sm">Local</label>
          {locaisList.length > 0 && (
            <button
              type="button"
              onClick={() => setModo(modo === 'novo' ? 'existente' : 'novo')}
              className="text-sm text-brand-600 font-medium"
            >
              {modo === 'novo' ? 'Já fomos lá? Escolher local existente' : '+ Cadastrar novo local'}
            </button>
          )}
        </div>

        {modo === 'novo' ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            {localCriado ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{localCriado.nome}</p>
                  <p className="text-xs text-gray-500">{localCriado.cidade}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalCriado(null)}
                  className="text-sm text-gray-500"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <AdminLocalForm embedded onSaved={handleLocalCriado} />
            )}
          </div>
        ) : (
          <select
            value={localIdSelecionado ?? ''}
            onChange={(e) => setLocalIdSelecionado(Number(e.target.value))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
          >
            {locaisList.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome} — {l.cidade}
              </option>
            ))}
          </select>
        )}
      </div>

      <PhotoUploadField onChange={setFoto} />

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-brand-600 text-white font-semibold py-3.5 text-lg active:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Abrindo…' : 'Abrir sessão'}
      </button>
    </form>
  );
}
