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
      className={`flex items-center gap-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 pl-3 py-3 ${
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
      {/* Alça de arraste isolada: só ela recebe os listeners/touch-action:none
          do dnd-kit. O resto do card rola a página normalmente — antes o
          card inteiro "roubava" o gesto de scroll do dedo no celular. */}
      <button
        type="button"
        {...listeners}
        aria-label={`Arrastar ${item.nome} pra reordenar`}
        className="w-11 h-11 flex items-center justify-center shrink-0 text-gray-300 dark:text-gray-600 text-2xl touch-none cursor-grab active:cursor-grabbing"
      >
        ⠿
      </button>
    </li>
  );
}
