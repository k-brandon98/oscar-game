import express from 'express'
import { prisma } from '../db.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

router.get('/:year', async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const resultType = req.query.type || 'provisional'

    const leaderboard = await prisma.scoreSnapshot.findMany({
      where: {
        resultType,
        ballot: { oscarYear },
      },
      orderBy: [{ totalScore: 'desc' }, { scoredAt: 'asc' }],
      include: {
        ballot: {
          include: { user: true },
        },
      },
    })

    res.json(
      leaderboard.map((row) => ({
        username: row.ballot.user.username,
        totalScore: row.totalScore,
        scoredAt: row.scoredAt,
      }))
    )
  } catch {
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

router.get('/me/:year', auth, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const resultType = req.query.type || 'provisional'

    const ballot = await prisma.ballot.findUnique({
      where: {
        userId_oscarYear: {
          userId: req.user.userId,
          oscarYear,
        },
      },
    })

    if (!ballot) {
      return res.status(404).json({ error: 'Ballot not found' })
    }

    const snapshot = await prisma.scoreSnapshot.findUnique({
      where: {
        ballotId_resultType: {
          ballotId: ballot.id,
          resultType,
        },
      },
      include: {
        details: true,
      },
    })

    if (!snapshot) {
      return res.json({ totalScore: 0, details: [] })
    }

    res.json(snapshot)
  } catch {
    res.status(500).json({ error: 'Failed to fetch score' })
  }
})

export default router