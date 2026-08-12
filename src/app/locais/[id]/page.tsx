import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PLACEHOLDER_PHOTO_URL } from '@/lib/constants';

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default async function LocalDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const local = await prisma.local.findUnique({
    where: { id },
    include: {
      sessoes: {
        orderBy: { data: 'desc' },
        include: {
          avaliacoes: { include: { usuario: true } },
        },
      },
    },
  });

  if (!local) notFound();

  const todasAvaliacoes = local.sessoes.flatMap((s) => s.avaliacoes);
  const fotoMaisRecente = local.sessoes.find((s) => s.fotoUrl)?.fotoUrl || PLACEHOLDER_PHOTO_URL;

  const notaFinal = avg(todasAvaliacoes.map((a) => a.notaFinal));
  const mediaPeixe = avg(todasAvaliacoes.map((a) => a.notaPeixe));
  const mediaMolho = avg(todasAvaliacoes.map((a) => a.notaMolho));
  const mediaAcompanhamento = avg(todasAvaliacoes.map((a) => a.notaAcompanhamento));
  const mediaBemServido = avg(todasAvaliacoes.map((a) => a.estrelaBemServido));
  const mediaAtendimento = avg(todasAvaliacoes.map((a) => a.estrelaAtendimento));
  const mediaLimpeza = avg(todasAvaliacoes.map((a) => a.estrelaLimpeza));

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fotoMaisRecente}
        alt={local.nome}
        className="w-full rounded-2xl object-cover max-h-72 mb-4 bg-gray-100 dark:bg-gray-800"
      />

      <h1 className="text-xl font-bold">{local.nome}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{local.cidade}</p>
      {local.endereco && (
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">{local.endereco}</p>
      )}

      {todasAvaliacoes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Ainda sem avaliações.</p>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Nota final</span>
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                {notaFinal.toFixed(1)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-lg">🐟</p>
                <p className="font-semibold">{mediaPeixe.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-lg">🥣</p>
                <p className="font-semibold">{mediaMolho.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-lg">🍟</p>
                <p className="font-semibold">{mediaAcompanhamento.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Avaliação do local</p>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Bem servido</p>
                <p className="font-semibold">★ {mediaBemServido.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Atendimento</p>
                <p className="font-semibold">★ {mediaAtendimento.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Limpeza</p>
                <p className="font-semibold">★ {mediaLimpeza.toFixed(1)}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <h2 className="font-bold mb-2">Histórico de sessões</h2>
      <ul className="space-y-3">
        {local.sessoes.map((sessao) => (
          <li
            key={sessao.id}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {new Date(sessao.data).toLocaleDateString('pt-BR')}
                {sessao.isHistorico && (
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">(histórico)</span>
                )}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {sessao.avaliacoes.length} avaliação(ões)
              </span>
            </div>
            <ul className="space-y-1">
              {sessao.avaliacoes.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300"
                >
                  <span>{a.usuario.nome}</span>
                  <span className="tabular-nums">{a.notaFinal.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
