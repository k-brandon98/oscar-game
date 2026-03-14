import express from 'express'
import { auth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', auth, (req, res) => {
  res.json({
    userId: req.user.userId,
    username: req.user.username,
    isAdmin: !!req.user.isAdmin,
  })
})

export default router