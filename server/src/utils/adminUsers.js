export function getAdminUsernames() {
  return new Set(
    (process.env.ADMIN_USERNAMES || '')
      .split(',')
      .map((name) => name.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function isAdminUsername(username) {
  return getAdminUsernames().has(String(username || '').trim().toLowerCase())
}