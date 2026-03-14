export default function Leaderboard({ entries }) {
  if (!entries.length) {
    return (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
        <p className="mt-2 text-sm text-zinc-400">No scores yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
      <h2 className="text-lg font-semibold text-white">Leaderboard</h2>

      <div className="mt-4 space-y-2">
        {entries.map((entry, index) => (
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
        ))}
      </div>
    </div>
  )
}