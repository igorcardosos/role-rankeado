'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type FeelingItem = {
  localId: number;
  nome: string;
  cidade: string;
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
      className={`flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3 touch-none select-none ${
        isDragging ? 'opacity-60 shadow-lg' : ''
      }`}
    >
      <span className="w-7 text-center font-bold text-gray-400">{position}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{item.nome}</p>
        <p className="text-xs text-gray-500 truncate">{item.cidade}</p>
      </div>
      <span aria-hidden className="text-gray-300 text-xl px-1">
        ⠿
      </span>
    </li>
  );
}
