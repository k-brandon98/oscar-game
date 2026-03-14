import express from 'express'
import { prisma } from '../db.js'
import { auth } from '../middleware/auth.js'
import { admin } from '../middleware/admin.js'
import { scoreAllBallots } from '../utils/scoreBallots.js'

const router = express.Router()

router.use(admin)

router.get('/me', auth, (req, res) => {
  res.json({
    isAdmin: !!req.user?.isAdmin,
    username: req.user?.username || null,
  })
})

router.get('/results/:year', async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const resultType = req.query.type || 'provisional'

    const results = await prisma.officialResult.findMany({
      where: { oscarYear, resultType },
      orderBy: { category: 'asc' },
    })

    res.json(results)
  } catch {
    res.status(500).json({ error: 'Failed to fetch admin results' })
  }
})

router.post('/results/:year', admin, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const { category, winnerName, resultType = 'provisional' } = req.body

    if (!category || !winnerName) {
      return res.status(400).json({ error: 'category and winnerName are required' })
    }

    const result = await prisma.officialResult.upsert({
      where: {
        oscarYear_category_resultType: {
          oscarYear,
          category,
          resultType,
        },
      },
      update: {
        winnerName,
        releasedAt: new Date(),
      },
      create: {
        oscarYear,
        category,
        winnerName,
        resultType,
      },
    })

    res.json(result)
  } catch {
    res.status(500).json({ error: 'Failed to save admin result' })
  }
})

router.delete('/results/:year', admin, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const { category, resultType = 'provisional' } = req.body

    await prisma.officialResult.delete({
      where: {
        oscarYear_category_resultType: {
          oscarYear,
          category,
          resultType,
        },
      },
    })

    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete result' })
  }
})

router.post('/score/:year', admin, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const { resultType = 'provisional' } = req.body

    await scoreAllBallots(oscarYear, resultType)

    res.json({ success: true, resultType })
  } catch {
    res.status(500).json({ error: 'Failed to score ballots' })
  }
})

router.get('/leaderboard/:year', async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch admin leaderboard' })
  }
})

export default router