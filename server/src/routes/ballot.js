import express from 'express'
import { prisma } from '../db.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

router.get('/:year', auth, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)

    const ballot = await prisma.ballot.findUnique({
      where: {
        userId_oscarYear: {
          userId: req.user.userId,
          oscarYear,
        },
      },
      include: {
        picks: {
          orderBy: [{ category: 'asc' }, { rankPosition: 'asc' }],
        },
      },
    })

    if (!ballot) {
      return res.json({ oscarYear, rankings: {}, status: 'open' })
    }

    const rankings = {}
    for (const pick of ballot.picks) {
      if (!rankings[pick.category]) rankings[pick.category] = []
      rankings[pick.category].push(pick.nomineeName)
    }

    res.json({
      oscarYear,
      status: ballot.status,
      rankings,
    })
  } catch {
    res.status(500).json({ error: 'Failed to fetch ballot' })
  }
})

router.put('/:year', auth, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)
    const { rankings } = req.body

    if (!rankings || typeof rankings !== 'object') {
      return res.status(400).json({ error: 'Invalid rankings payload' })
    }

    let ballot = await prisma.ballot.findUnique({
      where: {
        userId_oscarYear: {
          userId: req.user.userId,
          oscarYear,
        },
      },
    })

    if (ballot && ballot.status !== 'open') {
      return res.status(403).json({ error: 'Ballot is locked' })
    }

    if (!ballot) {
      ballot = await prisma.ballot.create({
        data: {
          userId: req.user.userId,
          oscarYear,
          status: 'open',
        },
      })
    }

    const pickRows = Object.entries(rankings).flatMap(([category, nominees]) =>
      nominees.map((nomineeName, index) => ({
        ballotId: ballot.id,
        category,
        nomineeName,
        rankPosition: index,
      }))
    )

    await prisma.$transaction([
      prisma.ballotPick.deleteMany({ where: { ballotId: ballot.id } }),
      ...(pickRows.length > 0
        ? [prisma.ballotPick.createMany({ data: pickRows })]
        : []),
    ])

    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to save ballot' })
  }
})

router.post('/:year/lock', auth, async (req, res) => {
  try {
    const oscarYear = Number(req.params.year)

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

    await prisma.ballot.update({
      where: { id: ballot.id },
      data: { status: 'locked' },
    })

    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to lock ballot' })
  }
})

export default router