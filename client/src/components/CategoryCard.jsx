import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ATL_CATEGORIES, BEST_PICTURE, pointsForPosition } from '../data/oscarsData'
import { getNomineeText } from '../lib/scoring'
import SortableNomineeRow from './SortableNomineeRow.jsx'

export default function CategoryCard({
  category,
  ranking,
  winner,
  setWinner,
  onDragEnd,
  sensors,
}) {
  const pointsPreview = ranking.map((_, index) => pointsForPosition(category.category, index))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onDragEnd(category.category, active.id, over.id)
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{category.category}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {category.category === BEST_PICTURE
              ? 'max=100 pts'
              : ATL_CATEGORIES.has(category.category)
                ? 'max=50 pts'
                : 'max=25 pts'}
          </p>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-zinc-400">
            Actual winner
          </label>

          {winner ? (
            <span className="rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-semibold text-amber-300">
              🏆 Announced
            </span>
          ) : (
            <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-semibold text-zinc-400">
              ✨ Pending
            </span>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ranking} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {ranking.map((nomineeName, index) => {
              const nominee = category.nominees.find((n) => n.name === nomineeName)
              if (!nominee) return null

              return (
                <SortableNomineeRow
                  key={nomineeName}
                  category={category}
                  nominee={nominee}
                  nomineeName={nomineeName}
                  index={index}
                  winner={winner}
                  pointsPreview={pointsPreview}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}