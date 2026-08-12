'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type FeelingItem = {
  localId: number;
  nome: string;
  cidade: string;
  fotoUrl: string;
};

export default function FeelingDraggableItem({ item, position }: { item: FeelingItem; position: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.localId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-3 py-3 touch-none select-none ${
        isDragging ? 'opacity-60 shadow-lg' : ''
      }`}
    >
      <span className="w-6 text-center font-bold text-gray-400 dark:text-gray-500 shrink-0">
        {position}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.fotoUrl}
        alt={item.nome}
        className="w-11 h-11 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{item.nome}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.cidade}</p>
      </div>
      <span aria-hidden className="text-gray-300 dark:text-gray-600 text-xl px-1 shrink-0">
        ⠿
      </span>
    </li>
  );
}
