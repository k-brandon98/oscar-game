import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import NomineeImage from './NomineeImage.jsx'
import { getNomineeSubtext, getNomineeText } from '../lib/scoring'

export default function SortableNomineeRow({
  category,
  nominee,
  nomineeName,
  index,
  winner,
  pointsPreview,
}) {
  const isWinner = winner === nomineeName
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: nomineeName,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[auto_1fr_auto] gap-3 rounded-2xl border p-3 transition ${
        isWinner ? 'border-amber-500/60 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900/70'
      }`}
    >
      <NomineeImage categoryName={category.category} nominee={nominee} />

      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-300">
            #{index + 1}
          </span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
            {pointsPreview[index]} pts if correct
          </span>
        </div>

        <div className="truncate text-sm font-semibold text-white">
          {getNomineeText(category.category, nominee)}
        </div>

        {getNomineeSubtext(category.category, nominee) ? (
          <div className="mt-1 truncate text-xs text-zinc-400">
            {getNomineeSubtext(category.category, nominee)}
          </div>
        ) : null}
      </div>

      <button
        {...attributes}
        {...listeners}
        className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 active:cursor-grabbing"
        title="Drag to reorder"
      >
        &#8801;
      </button>
    </div>
  )
}