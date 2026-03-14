import { useEffect, useMemo, useState } from 'react'
import { OSCAR_DATA } from '../data/oscarsData.js'
import {
  adminGetLeaderboard,
  adminGetResults,
  adminSaveResult,
  adminScore,
} from '../lib/api.js'
import { getNomineeText } from '../lib/scoring.js'

export default function AdminPanel({ year }) {
  const [resultType, setResultType] = useState('provisional')
  const [resultsMap, setResultsMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [leaderboard, setLeaderboard] = useState([])

  const categories = useMemo(() => OSCAR_DATA.map((c) => c.category), [])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setMessage('')
        const [results, board] = await Promise.all([
          adminGetResults(year, resultType),
          adminGetLeaderboard(year, resultType),
        ])

        const next = {}
        for (const row of results) {
          next[row.category] = row.winnerName
        }
        setResultsMap(next)
        setLeaderboard(board)
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [year, resultType])

  function updateWinner(category, winnerName) {
    setResultsMap((prev) => ({
      ...prev,
      [category]: winnerName,
    }))
  }

  async function saveOne(category) {
    try {
      setMessage('')
      const winnerName = resultsMap[category]
      if (!winnerName) {
        setMessage(`Pick a winner for ${category} first.`)
        return
      }

      await adminSaveResult(year, category, winnerName, resultType)
      setMessage(`Saved ${category} (${resultType}).`)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function scoreAll() {
    try {
      setLoading(true)
      setMessage('')
      await adminScore(year, resultType)
      const board = await adminGetLeaderboard(year, resultType)
      setLeaderboard(board)
      setMessage(`Scored all ballots for ${resultType}.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-3xl border border-red-900 bg-zinc-950 p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Admin</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Enter winners and release {resultType} scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={resultType}
            onChange={(e) => setResultType(e.target.value)}
            className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="provisional">Provisional</option>
            <option value="final">Final</option>
          </select>

          <button
            onClick={scoreAll}
            disabled={loading}
            className="rounded-2xl bg-red-500 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Working...' : `Score ${resultType}`}
          </button>
        </div>
      </div>

      {message ? (
        <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">
          {message}
        </div>
      ) : null}

      <div className="space-y-3">
        {OSCAR_DATA.map((category) => (
          <div
            key={category.category}
            className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 md:grid-cols-[1fr_260px_auto]"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {category.category}
              </div>
            </div>

            <select
              value={resultsMap[category.category] || ''}
              onChange={(e) => updateWinner(category.category, e.target.value)}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="">Select winner</option>
              {category.nominees.map((nominee) => (
                <option key={nominee.name} value={nominee.name}>
                  {getNomineeText(category.category, nominee)}
                </option>
              ))}
            </select>

            <button
              onClick={() => saveOne(category.category)}
              className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
            >
              Save
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          {resultType} leaderboard preview
        </h3>

        <div className="space-y-2">
          {leaderboard.length ? (
            leaderboard.map((entry, index) => (
              <div
                key={`${entry.username}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3"
              >
                <div className="text-sm text-zinc-300">
                  <span className="mr-3 text-zinc-500">#{index + 1}</span>
                  {entry.username}
                </div>
                <div className="font-semibold text-amber-300">{entry.totalScore}</div>
              </div>
            ))
          ) : (
            <div className="text-sm text-zinc-500">No scored ballots yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}