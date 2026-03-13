import { useEffect, useMemo, useState } from 'react'
import { Trophy, Film, ChevronUp, ChevronDown, Search, RefreshCcw, Star } from 'lucide-react'
import { OSCAR_DATA, BEST_PICTURE, pointsForPosition } from './oscarsData'

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'
const STORAGE_KEY = 'oscars-2026-picks-app'

// TMDB key now comes from Vite env
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

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

function moveItem(list, from, to) {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function Poster({ title }) {
  const [posterPath, setPosterPath] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadPoster() {
      if (!TMDB_API_KEY || !title) return

      try {
        setLoading(true)
        const url = new URL('https://api.themoviedb.org/3/search/movie')
        url.searchParams.set('api_key', TMDB_API_KEY)
        url.searchParams.set('query', title)
        url.searchParams.set('include_adult', 'false')

        const res = await fetch(url.toString())
        const data = await res.json()
        const firstWithPoster = (data?.results || []).find((item) => item.poster_path)

        if (!cancelled) {
          setPosterPath(firstWithPoster?.poster_path || '')
        }
      } catch {
        if (!cancelled) setPosterPath('')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPoster()

    return () => {
      cancelled = true
    }
  }, [title])

  if (!TMDB_API_KEY) {
    return (
      <div className="flex h-28 w-20 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/70 text-center text-[10px] text-zinc-400">
        No TMDB key
      </div>
    )
  }

  if (posterPath) {
    return (
      <img
        src={`${POSTER_BASE}${posterPath}`}
        alt={title}
        className="h-28 w-20 rounded-xl object-cover shadow"
      />
    )
  }

  return (
    <div className="flex h-28 w-20 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-center text-[10px] text-zinc-400">
      {loading ? 'Loading…' : 'No poster'}
    </div>
  )
}

function CategoryCard({ category, ranking, winner, setWinner, onMove }) {
  const pointsPreview = ranking.map((_, index) =>
    pointsForPosition(category.category, index)
  )

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{category.category}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {category.category === BEST_PICTURE
              ? '1st = 50, 2nd = 15, then 7 → 0'
              : '1st = 20, 2nd = 7, then 2, 1, 0'}
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
                {nominee.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {ranking.map((nomineeName, index) => {
          const nominee = category.nominees.find((n) => n.name === nomineeName)
          const isWinner = winner === nomineeName

          return (
            <div
              key={nomineeName}
              className={`grid grid-cols-[auto_1fr_auto] gap-3 rounded-2xl border p-3 transition ${
                isWinner
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-zinc-800 bg-zinc-900/70'
              }`}
            >
              <Poster title={nominee?.movie || nominee?.name} />

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
                  {nominee?.name}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onMove(category.category, index, index - 1)}
                  disabled={index === 0}
                  className="rounded-2xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-200 disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onMove(category.category, index, index + 1)}
                  disabled={index === ranking.length - 1}
                  className="rounded-2xl border border-zinc-700 bg-zinc-900 p-2 text-zinc-200 disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function App() {
  const [state, setState] = useState(makeInitialState)
  const [search, setSearch] = useState('')

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

  function moveRanking(categoryName, from, to) {
    setState((prev) => {
      const current = prev.rankings[categoryName]
      if (!current || to < 0 || to >= current.length) return prev

      return {
        ...prev,
        rankings: {
          ...prev.rankings,
          [categoryName]: moveItem(current, from, to),
        },
      }
    })
  }

  function resetAll() {
    setState(makeInitialState())
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="mb-8 flex items-start gap-4">
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

        <div className="grid gap-6 xl:grid-cols-2">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.category}
              category={category}
              ranking={state.rankings[category.category] || []}
              winner={state.winners[category.category] || ''}
              setWinner={setWinner}
              onMove={moveRanking}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
