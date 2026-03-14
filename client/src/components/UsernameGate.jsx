import { useState } from 'react'

export default function UsernameGate({ onSubmit, loading, error }) {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [adminPin, setAdminPin] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const value = username.trim()
    const pinValue = pin.trim()
    if (!value || !pinValue) return
    onSubmit(value, pinValue, adminPin.trim())
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
      <h1 className="text-2xl font-bold text-white">Sign in or claim username</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Use a username and PIN. If the username is new, it will be claimed for you.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none"
        />

        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="your PIN"
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none"
        />

        <input
          type="password"
          value={adminPin}
          onChange={(e) => setAdminPin(e.target.value)}
          placeholder="admin PIN (only if you're an admin)"
          className="w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none"
        />

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-amber-500 px-4 py-3 font-medium text-black disabled:opacity-60"
        >
          {loading ? 'Loading...' : 'Continue'}
        </button>
      </form>
    </div>
  )
}