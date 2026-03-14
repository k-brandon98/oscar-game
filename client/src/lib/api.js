import { getToken } from './auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3001'

async function request(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || 'Request failed')
  }

  return data
}

export async function identify(username, pin, adminPin = '') {
  return request('/api/identify', {
    method: 'POST',
    body: JSON.stringify({ username, pin, adminPin }),
  })
}

export async function getMe() {
  return request('/api/me')
}

export async function getBallot(year) {
  return request(`/api/ballot/${year}`)
}

export async function saveBallot(year, rankings) {
  return request(`/api/ballot/${year}`, {
    method: 'PUT',
    body: JSON.stringify({ rankings }),
  })
}

export async function getLeaderboard(year, type = 'provisional') {
  return request(`/api/leaderboard/${year}?type=${type}`)
}

export async function adminGetResults(year, type = 'provisional') {
  return request(`/api/admin/results/${year}?type=${type}`)
}

export async function adminSaveResult(year, category, winnerName, resultType = 'provisional') {
  return request(`/api/admin/results/${year}`, {
    method: 'POST',
    body: JSON.stringify({ category, winnerName, resultType }),
  })
}

export async function adminScore(year, resultType = 'provisional') {
  return request(`/api/admin/score/${year}`, {
    method: 'POST',
    body: JSON.stringify({ resultType }),
  })
}

export async function adminGetLeaderboard(year, type = 'provisional') {
  return request(`/api/admin/leaderboard/${year}?type=${type}`)
}