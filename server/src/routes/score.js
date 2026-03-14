import express from 'express'
import { admin } from '../middleware/admin.js'
import { scoreAllBallots } from '../utils/scoreBallots.js'

const router = express.Router()

router.post('/:year', admin, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const { resultType = 'provisional' } = req.body

    await scoreAllBallots(oscarYear, resultType)

    res.json({ success: true, resultType })
  } catch {
    res.status(500).json({ error: 'Failed to score ballots' })
  }
})

export default router