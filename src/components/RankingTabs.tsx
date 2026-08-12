'use client';

import { useState } from 'react';
import RankingNotaList from '@/components/RankingNotaList';
import RankingFeelingTab from '@/components/RankingFeelingTab';
import type { NotaRankingRow, FeelingRankingRow } from '@/lib/scoring';
import type { FeelingItem } from '@/components/FeelingDraggableItem';

export default function RankingTabs({
  notaRows,
  feelingItems,
  grupoRanking,
}: {
  notaRows: NotaRankingRow[];
  feelingItems: FeelingItem[];
  grupoRanking: FeelingRankingRow[];
}) {
  const [tab, setTab] = useState<'nota' | 'feeling'>('nota');

  return (
    <div>
      <div className="flex gap-2 mb-4 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab('nota')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
            tab === 'nota' ? 'bg-white shadow text-brand-600' : 'text-gray-500'
          }`}
        >
          ⭐ Nota
        </button>
        <button
          onClick={() => setTab('feeling')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors ${
            tab === 'feeling' ? 'bg-white shadow text-brand-600' : 'text-gray-500'
          }`}
        >
          💭 Feeling
        </button>
      </div>

      {tab === 'nota' ? (
        <RankingNotaList rows={notaRows} />
      ) : (
        <RankingFeelingTab initialItems={feelingItems} grupoRanking={grupoRanking} />
      )}
    </div>
  );
}
