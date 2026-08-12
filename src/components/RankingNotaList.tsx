import Link from 'next/link';
import type { NotaRankingRow } from '@/lib/scoring';

const PODIO: Record<number, { medalha: string; anel: string; faixa: string }> = {
  0: { medalha: '🥇', anel: 'ring-2 ring-yellow-400', faixa: 'from-yellow-400 to-amber-500' },
  1: { medalha: '🥈', anel: 'ring-2 ring-gray-300', faixa: 'from-gray-300 to-gray-400' },
  2: { medalha: '🥉', anel: 'ring-2 ring-amber-600', faixa: 'from-amber-500 to-amber-700' },
};

export default function RankingNotaList({ rows }: { rows: NotaRankingRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-2">🏆</p>
        <p className="text-gray-500">Nenhuma avaliação registrada ainda.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row, idx) => {
        const podio = PODIO[idx];
        return (
          <li key={row.localId}>
            <Link
              href={`/locais/${row.localId}`}
              className={`relative flex items-center gap-3 bg-white rounded-3xl border border-gray-200 p-3 shadow-sm active:scale-[0.99] transition-transform overflow-hidden ${
                idx === 0 ? 'ring-2 ring-brand-400 shadow-brand-100' : ''
              }`}
            >
              {idx === 0 && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-brand-500 to-yellow-400" />
              )}

              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.fotoUrl}
                  alt={row.nome}
                  className={`w-16 h-16 rounded-2xl object-cover bg-gray-100 ${podio?.anel ?? ''}`}
                />
                <span
                  className={`absolute -top-2 -left-2 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white bg-gradient-to-br ${
                    podio?.faixa ?? 'from-gray-400 to-gray-500'
                  } shadow`}
                >
                  {podio ? podio.medalha : idx + 1}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{row.nome}</p>
                <p className="text-xs text-gray-500 truncate">{row.cidade}</p>
                <div className="flex gap-2.5 mt-1.5 text-xs">
                  <span className="flex items-center gap-0.5 bg-gray-50 rounded-full px-2 py-0.5 text-gray-600">
                    🐟 {row.mediaPeixe.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-0.5 bg-gray-50 rounded-full px-2 py-0.5 text-gray-600">
                    🥣 {row.mediaMolho.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-0.5 bg-gray-50 rounded-full px-2 py-0.5 text-gray-600">
                    🍟 {row.mediaAcompanhamento.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <span className="text-lg font-extrabold leading-none tabular-nums">
                  {row.notaFinal.toFixed(1)}
                </span>
                <span className="text-[9px] opacity-80 leading-none mt-0.5">/10</span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
