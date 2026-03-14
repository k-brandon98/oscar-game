export default function HelpPanel() {
  return (
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
            Acting and director categories show headshots. Most other categories show posters. Some categories also show film, country, writer, or composer beneath the main title.
          </div>
        </div>
      </div>
    </div>
  )
}