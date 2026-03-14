import { auth } from './auth.js'

export function admin(req, res, next) {
  auth(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin only' })
    }

    next()
  })
}