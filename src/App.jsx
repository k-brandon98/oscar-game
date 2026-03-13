import { useEffect, useMemo, useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trophy, Search, HelpCircle } from 'lucide-react'
import { OSCAR_DATA, BEST_PICTURE, ATL_CATEGORIES, pointsForPosition } from './oscarsData'

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const STORAGE_KEY = 'oscars-2026-picks-app'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY?.trim()

function makeInitialState() {
  return OSCAR_DATA.reduce(
    (acc, category) => {
      acc.rankings[category.category] = category.nominees.map((n) => n.name)
      acc.winners[category.category] = ''
      return acc
    },
    { rankings: {}, winners: {} }
  )
}

const ACTING_CATEGORIES = new Set([
  'Actor in a Leading Role',
  'Actor in a Supporting Role',
  'Actress in a Leading Role',
  'Actress in a Supporting Role',
])

function getImageSearchType(categoryName) {
  if (ACTING_CATEGORIES.has(categoryName) || categoryName === 'Best Director') {
    return 'person'
  }
  return 'movie'
}

function getImageQuery(categoryName, nominee) {
  if (getImageSearchType(categoryName) === 'person') {
    return nominee.name
  }
  return nominee.movie || nominee.name
}

function getNomineeText(categoryName, nominee) {
  if (categoryName === 'International Feature Film') {
    const parts = nominee.name.split('—')
    return parts.length > 1 ? parts[1].trim() : nominee.name
  }

  if (
    categoryName === 'Writing (Original Screenplay)' ||
    categoryName === 'Writing (Adapted Screenplay)' ||
    categoryName === 'Music (Original Score)'
  ) {
    const parts = nominee.name.split('—')
    return parts.length > 1 ? parts[0].trim() : nominee.name
  }

  return nominee.name
}

function getNomineeSubtext(categoryName, nominee) {
  if (
    categoryName === 'Best Director' ||
    categoryName === 'Actor in a Leading Role' ||
    categoryName === 'Actor in a Supporting Role' ||
    categoryName === 'Actress in a Leading Role' ||
    categoryName === 'Actress in a Supporting Role'
  ) {
    return nominee.movie
  }

  if (
    categoryName === 'Writing (Original Screenplay)' ||
    categoryName === 'Writing (Adapted Screenplay)' ||
    categoryName === 'Music (Original Score)'
  ) {
    const parts = nominee.name.split('—')
    return parts.length > 1 ? parts[1].trim() : ''
  }

  if (categoryName === 'International Feature Film') {
    const parts = nominee.name.split('—')
    return parts.length > 1 ? parts[0].trim() : ''
  }

  return ''
}

function NomineeImage({ categoryName, nominee }) {
  const [imagePath, setImagePath] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadImage() {
      if (!TMDB_API_KEY || !nominee) return

      try {
        setLoading(true)
        const searchType = getImageSearchType(categoryName)
        const query = getImageQuery(categoryName, nominee)
        const url = new URL(`https://api.themoviedb.org/3/search/${searchType}`)
        url.searchParams.set('api_key', TMDB_API_KEY)
        url.searchParams.set('query', query)
        url.searchParams.set('include_adult', 'false')

        const res = await fetch(url.toString())
        const data = await res.json()
        const pathField = searchType === 'person' ? 'profile_path' : 'poster_path'
        const firstWithImage = (data?.results || []).find((item) => item?.[pathField])

        if (!cancelled) setImagePath(firstWithImage?.[pathField] || '')
      } catch {
        if (!cancelled) setImagePath('')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadImage()
    return () => {
      cancelled = true
    }
  }, [categoryName, nominee])

  if (!TMDB_API_KEY) {
    return (
      <div
        style={{
          width: 80,
          height: 112,
          display: 'grid',
          placeItems: 'center',
          border: '1px dashed #666',
          borderRadius: 12,
          fontSize: 10,
        }}
      >
        No key
      </div>
    )
  }

  if (imagePath) {
    return (
      <img
        src={`${IMAGE_BASE}${imagePath}`}
        alt={nominee?.name || 'Nominee'}
        style={{ width: 80, height: 112, objectFit: 'cover', borderRadius: 12 }}
      />
    )
  }

  return (
    <div
      style={{
        width: 80,
        height: 112,
        display: 'grid',
        placeItems: 'center',
        border: '1px solid #333',
        borderRadius: 12,
        fontSize: 10,
      }}
    >
      {loading ? 'Loading…' : 'No image'}
    </div>
  )
}

function SortableNomineeRow({ category, nominee, nomineeName, index, winner, pointsPreview }) {
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

function CategoryCard({ category, ranking, winner, setWinner, onDragEnd, sensors }) {
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

        <div className="min-w-[220px]">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-400">
            Actual winner
          </label>
          <select
            value={winner}
            onChange={(e) => setWinner(category.category, e.target.value)}
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="">Select winner</option>
            {category.nominees.map((nominee) => (
              <option key={nominee.name} value={nominee.name}>
                {getNomineeText(category.category, nominee)}
              </option>
            ))}
          </select>
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

export default function App() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const [state, setState] = useState(makeInitialState)
  const [search, setSearch] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setState((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const scoredCategories = useMemo(() => {
    return OSCAR_DATA.map((category) => {
      const ranking = state.rankings[category.category] || []
      const winner = state.winners[category.category]
      const winnerIndex = ranking.findIndex((name) => name === winner)
      const score = winner ? pointsForPosition(category.category, winnerIndex) : 0

      return {
        category: category.category,
        score,
        winner,
        correctAt: winnerIndex >= 0 ? winnerIndex + 1 : null,
      }
    })
  }, [state])

  const totalScore = scoredCategories.reduce((sum, item) => sum + item.score, 0)

  const filteredCategories = OSCAR_DATA.filter((category) => {
    const q = search.toLowerCase()
    return (
      category.category.toLowerCase().includes(q) ||
      category.nominees.some((nominee) => nominee.name.toLowerCase().includes(q))
    )
  })

  function setWinner(categoryName, winnerName) {
    setState((prev) => ({
      ...prev,
      winners: { ...prev.winners, [categoryName]: winnerName },
    }))
  }

  function moveRanking(categoryName, activeId, overId) {
    setState((prev) => {
      const current = prev.rankings[categoryName]
      if (!current) return prev

      const oldIndex = current.indexOf(activeId)
      const newIndex = current.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev

      return {
        ...prev,
        rankings: {
          ...prev.rankings,
          [categoryName]: arrayMove(current, oldIndex, newIndex),
        },
      }
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-500/15 p-3 text-amber-300">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Oscar Picks Scorer</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Rank your picks and score your ballot once winners are known.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHelp((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
            aria-label="Toggle help"
            title="How to use this app"
          >
            <HelpCircle className="h-4 w-4" />
            ?
          </button>
        </div>

        {showHelp && (
          <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-white">How to use this app</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-sm font-semibold text-white">Rank nominees</div>
                <div className="mt-2 text-sm text-zinc-400">
                  Drag nominees within a category to reorder your picks. Higher spots are worth more points.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-sm font-semibold text-white">Set winners</div>
                <div className="mt-2 text-sm text-zinc-400">
                  Use the dropdown in each category to select the actual winner once the Oscars are announced.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-sm font-semibold text-white">Scoring</div>
                <div className="mt-2 text-sm text-zinc-400">
                  Best Picture is worth the most, above-the-line categories are next, and craft categories are below that.
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-sm font-semibold text-white">Images and labels</div>
                <div className="mt-2 text-sm text-zinc-400">
                  Acting and directing categories show headshots. Most other categories show posters. Some categories also show film, country, writer, or composer beneath the main title.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or nominees"
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </div>

        <div className="mb-8 text-xl font-bold text-amber-300">Score: {totalScore}</div>

        <div className="mb-4 text-sm text-zinc-400">
          Drag nominees to reorder them.
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.category}
              category={category}
              ranking={state.rankings[category.category] || []}
              winner={state.winners[category.category] || ''}
              setWinner={setWinner}
              onDragEnd={moveRanking}
              sensors={sensors}
            />
          ))}
        </div>
      </div>
    </div>
  )
}