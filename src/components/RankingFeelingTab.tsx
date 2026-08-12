'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'pessoal' | 'grupo'>('pessoal');

  // Ressincroniza com o servidor quando os props mudam (ex: depois de um
  // router.refresh() bem-sucedido, ou ao voltar pra essa tela).
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  async function persist(newItems: FeelingItem[], previousItems: FeelingItem[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/feeling', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: newItems.map((item, idx) => ({ localId: item.localId, posicaoPessoal: idx + 1 })),
        }),
      });
      if (!res.ok) {
        setItems(previousItems);
        setError('Não foi possível salvar a nova ordem. Tente de novo.');
        return;
      }
      // Reflete a mudança pro resto do app (aba Grupo, outras telas) e
      // invalida o cache de navegação, senão voltar pra essa tela mais
      // tarde pode mostrar a ordem antiga.
      router.refresh();
    } catch {
      setItems(previousItems);
      setError('Não foi possível salvar a nova ordem. Tente de novo.');
    } finally {
      setSaving(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const previous = items;
    const oldIndex = previous.findIndex((i) => i.localId === active.id);
    const newIndex = previous.findIndex((i) => i.localId === over.id);
    const next = arrayMove(previous, oldIndex, newIndex);
    setItems(next);
    persist(next, previous);
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('pessoal')}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            view === 'pessoal'
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          Minha lista
        </button>
        <button
          onClick={() => setView('grupo')}
          className={`flex-1 rounded-xl py-2 text-sm font-medium ${
            view === 'grupo'
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          Grupo
        </button>
      </div>

      {view === 'pessoal' ? (
        items.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-10">
            Avalie uma sessão para começar a montar sua lista Feeling.
          </p>
        ) : (
          <>
            <p
              className={`text-xs mb-2 ${
                error ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {error ?? (saving ? 'Salvando…' : 'Arraste para reordenar')}
            </p>
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
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">
          Ninguém montou uma lista Feeling ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {grupoRanking.map((row, idx) => (
            <li key={row.localId}>
              <Link
                href={`/locais/${row.localId}`}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-3 py-3 active:bg-gray-50 dark:active:bg-gray-800"
              >
                <span className="w-6 text-center font-bold text-gray-400 dark:text-gray-500 shrink-0">
                  {idx + 1}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.fotoUrl}
                  alt={row.nome}
                  className="w-11 h-11 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{row.nome}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.cidade}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  {row.totalVotos} voto(s)
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
