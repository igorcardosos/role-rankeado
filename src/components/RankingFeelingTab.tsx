'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import FeelingDraggableItem, { FeelingItem } from '@/components/FeelingDraggableItem';
import type { FeelingRankingRow } from '@/lib/scoring';

export default function RankingFeelingTab({
  initialItems,
  grupoRanking,
}: {
  initialItems: FeelingItem[];
  grupoRanking: FeelingRankingRow[];
}) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<'pessoal' | 'grupo'>('pessoal');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  async function persist(newItems: FeelingItem[]) {
    setSaving(true);
    try {
      await fetch('/api/feeling', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: newItems.map((item, idx) => ({ localId: item.localId, posicaoPessoal: idx + 1 })),
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.localId === active.id);
      const newIndex = prev.findIndex((i) => i.localId === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      persist(next);
      return next;
    });
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('pessoal')}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            view === 'pessoal' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          Minha lista
        </button>
        <button
          onClick={() => setView('grupo')}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            view === 'grupo' ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}
        >
          Grupo
        </button>
      </div>

      {view === 'pessoal' ? (
        items.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Avalie uma sessão para começar a montar sua lista Feeling.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-2">{saving ? 'Salvando…' : 'Arraste para reordenar'}</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={items.map((i) => i.localId)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {items.map((item, idx) => (
                    <FeelingDraggableItem key={item.localId} item={item} position={idx + 1} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </>
        )
      ) : grupoRanking.length === 0 ? (
        <p className="text-gray-500 text-center py-10">Ninguém montou uma lista Feeling ainda.</p>
      ) : (
        <ul className="space-y-2">
          {grupoRanking.map((row, idx) => (
            <li key={row.localId}>
              <Link
                href={`/locais/${row.localId}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3 active:bg-gray-50"
              >
                <span className="w-7 text-center font-bold text-gray-400">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{row.nome}</p>
                  <p className="text-xs text-gray-500 truncate">{row.cidade}</p>
                </div>
                <span className="text-xs text-gray-400">{row.totalVotos} voto(s)</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
