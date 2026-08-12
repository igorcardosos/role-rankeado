import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { getNotaRanking, getFeelingRanking } from '@/lib/scoring';
import { getAppConfig } from '@/lib/config';
import { PLACEHOLDER_PHOTO_URL } from '@/lib/constants';
import RankingTabs from '@/components/RankingTabs';

export default async function RankingPage() {
  const session = await requireUser();

  const [notaRows, grupoRanking, feelingVotos, { nomeApp }] = await Promise.all([
    getNotaRanking(),
    getFeelingRanking(),
    prisma.feelingVoto.findMany({
      where: { usuarioId: session.sub },
      include: {
        local: {
          include: {
            sessoes: { orderBy: { data: 'desc' }, take: 1, select: { fotoUrl: true } },
          },
        },
      },
      orderBy: { posicaoPessoal: 'asc' },
    }),
    getAppConfig(),
  ]);

  const feelingItems = feelingVotos.map((voto) => ({
    localId: voto.localId,
    nome: voto.local.nome,
    cidade: voto.local.cidade,
    fotoUrl: voto.local.sessoes[0]?.fotoUrl ?? PLACEHOLDER_PHOTO_URL,
  }));

  const lider = notaRows[0];
  const totalAvaliacoes = notaRows.reduce((sum, r) => sum + r.totalAvaliacoes, 0);

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-amber-600 text-white p-5 mb-5 shadow-lg shadow-brand-200/50 dark:shadow-none">
        <div className="absolute -right-6 -top-6 text-8xl opacity-20 rotate-12">🐟</div>
        <div className="relative">
          <p className="text-xs font-semibold tracking-wide uppercase opacity-80">{nomeApp}</p>
          <h1 className="text-2xl font-extrabold mt-0.5">🏆 Ranking do grupo</h1>

          {lider ? (
            <div className="mt-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lider.fotoUrl}
                alt={lider.nome}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/80"
              />
              <div className="min-w-0">
                <p className="text-xs opacity-80">Líder atual</p>
                <p className="font-bold truncate">
                  {lider.nome} <span className="font-normal opacity-80">· {lider.cidade}</span>
                </p>
              </div>
              <span className="ml-auto text-2xl font-extrabold tabular-nums">
                {lider.notaFinal.toFixed(1)}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-sm opacity-90">Ainda ninguém avaliou nenhum rolê.</p>
          )}

          <div className="flex items-center gap-4 mt-4 text-xs opacity-90">
            <span>📍 {notaRows.length} local(is)</span>
            <span>📝 {totalAvaliacoes} avaliação(ões)</span>
          </div>

          {session.papel === 'ADMIN' && (
            <Link
              href="/sessao/nova"
              className="inline-flex items-center gap-1.5 mt-4 rounded-xl bg-white text-brand-700 text-sm font-bold px-4 py-2.5 active:bg-white/90"
            >
              + Nova sessão
            </Link>
          )}
        </div>
      </div>

      <RankingTabs notaRows={notaRows} feelingItems={feelingItems} grupoRanking={grupoRanking} />
    </div>
  );
}
