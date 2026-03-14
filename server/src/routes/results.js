import express from 'express'
import { prisma } from '../db.js'
import { admin } from '../middleware/admin.js'

const router = express.Router()

router.post('/:year', admin, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const { category, winnerName, resultType = 'provisional' } = req.body

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
    res.status(500).json({ error: 'Failed to save result' })
  }
})

router.get('/:year', async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const resultType = req.query.type || 'provisional'

    const results = await prisma.officialResult.findMany({
      where: { oscarYear, resultType },
      orderBy: { category: 'asc' },
    })

    res.json(results)
  } catch {
    res.status(500).json({ error: 'Failed to fetch results' })
  }
})

export default router