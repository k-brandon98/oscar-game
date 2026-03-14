import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { prisma } from '../db.js'
import { isAdminUsername } from '../utils/adminUsers.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { username, pin, adminPin } = req.body

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username required' })
    }

    if (!pin || typeof pin !== 'string') {
      return res.status(400).json({ error: 'PIN required' })
    }

    const normalized = username.trim()
    const normalizedPin = pin.trim()

    if (!normalized) {
      return res.status(400).json({ error: 'Username required' })
    }

    if (!normalizedPin) {
      return res.status(400).json({ error: 'PIN required' })
    }

    const wantsAdmin = isAdminUsername(normalized)

    if (wantsAdmin && adminPin !== process.env.ADMIN_PIN) {
      return res.status(403).json({ error: 'Admin PIN required' })
    }

    let user = await prisma.user.findUnique({
      where: { username: normalized },
    })

    if (!user) {
      const pinHash = await bcrypt.hash(normalizedPin, 10)

      user = await prisma.user.create({
        data: {
          username: normalized,
          pinHash,
        },
      })
    } else {
      const ok = await bcrypt.compare(normalizedPin, user.pinHash)
      if (!ok) {
        return res.status(401).json({ error: 'Invalid PIN' })
      }
    }

    const isAdmin = wantsAdmin

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      token,
      username: user.username,
      isAdmin,
    })
  } catch {
    res.status(500).json({ error: 'Failed to identify user' })
  }
})

export default router