import { prisma } from '../db.js'
import { pointsForPosition } from '../constants/scoring.js'

export async function scoreAllBallots(oscarYear, resultType) {
  const results = await prisma.officialResult.findMany({
    where: { oscarYear, resultType },
  })

  const winnerMap = Object.fromEntries(
    results.map((r) => [r.category, r.winnerName])
  )

  const ballots = await prisma.ballot.findMany({
    where: { oscarYear },
    include: { picks: true },
  })

  for (const ballot of ballots) {
    const rankingsByCategory = {}

    for (const pick of ballot.picks) {
      if (!rankingsByCategory[pick.category]) rankingsByCategory[pick.category] = []
      rankingsByCategory[pick.category][pick.rankPosition] = pick.nomineeName
    }

    let totalScore = 0
    const details = []

    for (const [category, winnerName] of Object.entries(winnerMap)) {
      const ranking = rankingsByCategory[category] || []
      const winnerIndex = ranking.indexOf(winnerName)
      const points = winnerIndex >= 0 ? pointsForPosition(category, winnerIndex) : 0

      totalScore += points
      details.push({
        category,
        winnerName,
        winnerRankPosition: winnerIndex >= 0 ? winnerIndex + 1 : null,
        pointsAwarded: points,
      })
    }

    const snapshot = await prisma.scoreSnapshot.upsert({
      where: {
        ballotId_resultType: {
          ballotId: ballot.id,
          resultType,
        },
      },
      update: {
        totalScore,
        scoredAt: new Date(),
      },
      create: {
        ballotId: ballot.id,
        resultType,
        totalScore,
      },
    })

    await prisma.scoreDetail.deleteMany({
      where: { scoreSnapshotId: snapshot.id },
    })

    if (details.length > 0) {
      await prisma.scoreDetail.createMany({
        data: details.map((d) => ({
          scoreSnapshotId: snapshot.id,
          category: d.category,
          winnerName: d.winnerName,
          winnerRankPosition: d.winnerRankPosition,
          pointsAwarded: d.pointsAwarded,
        })),
      })
    }
  }
}