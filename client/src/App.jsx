import { useEffect, useMemo, useState } from 'react'
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { HelpCircle, Search, Trophy } from 'lucide-react'

import CategoryCard from './components/CategoryCard.jsx'
import HelpPanel from './components/HelpPanel.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import UsernameGate from './components/UsernameGate.jsx'
import AdminPanel from './components/AdminPanel.jsx'

import { OSCAR_DATA, pointsForPosition } from './data/oscarsData.js'
import { identify, getBallot, getLeaderboard, saveBallot, getMe } from './lib/api.js'
import { getToken, getUsername, getIsAdmin, saveAuth, clearAuth } from './lib/auth.js'

const STORAGE_KEY = 'oscars-2026-picks-app'
const OSCAR_YEAR = 2026

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

export default function App() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const [state, setState] = useState(makeInitialState)
  const [search, setSearch] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const [username, setUsername] = useState(getUsername())
  const [loadingUser, setLoadingUser] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  const [leaderboard, setLeaderboard] = useState([])
  const [saving, setSaving] = useState(false)

  const [showAdmin, setShowAdmin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(getIsAdmin())

  useEffect(() => {
    async function detectAdmin() {
      try {
        const data = await checkAdmin()
        setIsAdmin(data.isAdmin)
      } catch {
        setIsAdmin(false)
      }
    }

    detectAdmin()
  }, [])

  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) return

      try {
        const me = await getMe()
        setUsername(me.username)
        setIsAdmin(!!me.isAdmin)
      } catch {
        clearAuth()
        setUsername('')
        setIsAdmin(false)
      }
    }

    restoreSession()
  }, [])

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

  useEffect(() => {
    async function loadRemoteBallot() {
      if (!getToken()) return

      try {
        const ballot = await getBallot(OSCAR_YEAR)
        if (ballot?.rankings) {
          setState((prev) => ({
            ...prev,
            rankings: { ...prev.rankings, ...ballot.rankings },
          }))
        }
      } catch (error) {
        console.error('Failed to load ballot:', error.message)
      }
    }

    loadRemoteBallot()
  }, [])

  useEffect(() => {
    async function loadLeaderboardData() {
      try {
        const data = await getLeaderboard(OSCAR_YEAR, 'provisional')
        setLeaderboard(data)
      } catch (error) {
        console.error('Failed to load leaderboard:', error.message)
      }
    }

    loadLeaderboardData()
  }, [])

  const scoredCategories = useMemo(() => {
    return OSCAR_DATA.map((category) => {
      const ranking = state.rankings[category.category] || []
      const winner = state.winners[category.category]
      const winnerIndex = ranking.findIndex((name) => name === winner)
      const score = winner ? pointsForPosition(category.category, winnerIndex) : 0

      return {
        category: category.category,
        score,
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

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return prev
      }

      return {
        ...prev,
        rankings: {
          ...prev.rankings,
          [categoryName]: arrayMove(current, oldIndex, newIndex),
        },
      }
    })
  }

  async function handleUsernameSubmit(value, pin, adminPin) {
    try {
      setLoadingUser(true)
      setUsernameError('')

      const data = await identify(value, pin, adminPin)
      saveAuth(data.token, data.username, data.isAdmin)
      setUsername(data.username)
      setIsAdmin(!!data.isAdmin)

      const ballot = await getBallot(OSCAR_YEAR)
      if (ballot?.rankings) {
        setState((prev) => ({
          ...prev,
          rankings: { ...prev.rankings, ...ballot.rankings },
        }))
      }
    } catch (error) {
      setUsernameError(error.message)
    } finally {
      setLoadingUser(false)
    }
  }

  async function handleSaveBallot() {
    try {
      setSaving(true)
      await saveBallot(OSCAR_YEAR, state.rankings)
      alert('Ballot saved.')
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  function handleSignOut() {
    clearAuth()
    setUsername('')
    setIsAdmin(false)
    setUsernameError('')
  }

  if (!username) {
    return (
      <div className="min-h-screen bg-black px-6 py-16 text-white">
        <UsernameGate
          onSubmit={handleUsernameSubmit}
          loading={loadingUser}
          error={usernameError}
        />
      </div>
    )
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
                Signed in as <span className="font-semibold">{username}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowAdmin((prev) => !prev)}
                className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
              >
                Admin
              </button>
            )}
            <button
              onClick={() => setShowHelp((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-800"
              title="How to use this app"
            >
              <HelpCircle className="h-4 w-4" />
              ?
            </button>

            <button
              onClick={handleSignOut}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>

        {showHelp ? <HelpPanel /> : null}
        {showAdmin ? <AdminPanel year={OSCAR_YEAR} /> : null}

        <div className="mb-6 flex items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or nominees"
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-xl font-bold text-amber-300">Score: {totalScore}</div>
          <button
            onClick={handleSaveBallot}
            disabled={saving}
            className="rounded-2xl bg-amber-500 px-4 py-2 font-medium text-black disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save ballot'}
          </button>
        </div>

        <div className="mb-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="text-sm text-zinc-400">Drag nominees to reorder them.</div>
          <Leaderboard entries={leaderboard} />
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