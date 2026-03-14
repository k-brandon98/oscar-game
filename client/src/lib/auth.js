const TOKEN_KEY = 'oscar-game-token'
const USERNAME_KEY = 'oscar-game-username'
const ADMIN_KEY = 'oscar-game-is-admin'

export function saveAuth(token, username, isAdmin) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USERNAME_KEY, username)
  localStorage.setItem(ADMIN_KEY, String(!!isAdmin))
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY) || ''
}

export function getIsAdmin() {
  return localStorage.getItem(ADMIN_KEY) === 'true'
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USERNAME_KEY)
  localStorage.removeItem(ADMIN_KEY)
}