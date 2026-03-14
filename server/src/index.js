import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import identifyRoutes from './routes/identify.js'
import ballotRoutes from './routes/ballot.js'
import resultsRoutes from './routes/results.js'
import scoreRoutes from './routes/score.js'
import leaderboardRoutes from './routes/leaderboard.js'
import adminRoutes from './routes/admin.js'
import meRoutes from './routes/me.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/identify', identifyRoutes)
app.use('/api/ballot', ballotRoutes)
app.use('/api/results', resultsRoutes)
app.use('/api/score', scoreRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/me', meRoutes)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})