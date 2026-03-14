-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ballot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oscarYear" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ballot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BallotPick" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nomineeName" TEXT NOT NULL,
    "rankPosition" INTEGER NOT NULL,

    CONSTRAINT "BallotPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialResult" (
    "id" TEXT NOT NULL,
    "oscarYear" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "winnerName" TEXT NOT NULL,
    "resultType" TEXT NOT NULL DEFAULT 'provisional',
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficialResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" TEXT NOT NULL,
    "ballotId" TEXT NOT NULL,
    "resultType" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreDetail" (
    "id" TEXT NOT NULL,
    "scoreSnapshotId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "winnerName" TEXT NOT NULL,
    "winnerRankPosition" INTEGER,
    "pointsAwarded" INTEGER NOT NULL,

    CONSTRAINT "ScoreDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Ballot_userId_oscarYear_key" ON "Ballot"("userId", "oscarYear");

-- CreateIndex
CREATE UNIQUE INDEX "BallotPick_ballotId_category_nomineeName_key" ON "BallotPick"("ballotId", "category", "nomineeName");

-- CreateIndex
CREATE UNIQUE INDEX "BallotPick_ballotId_category_rankPosition_key" ON "BallotPick"("ballotId", "category", "rankPosition");

-- CreateIndex
CREATE UNIQUE INDEX "OfficialResult_oscarYear_category_resultType_key" ON "OfficialResult"("oscarYear", "category", "resultType");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreSnapshot_ballotId_resultType_key" ON "ScoreSnapshot"("ballotId", "resultType");

-- AddForeignKey
ALTER TABLE "Ballot" ADD CONSTRAINT "Ballot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallotPick" ADD CONSTRAINT "BallotPick_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSnapshot" ADD CONSTRAINT "ScoreSnapshot_ballotId_fkey" FOREIGN KEY ("ballotId") REFERENCES "Ballot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreDetail" ADD CONSTRAINT "ScoreDetail_scoreSnapshotId_fkey" FOREIGN KEY ("scoreSnapshotId") REFERENCES "ScoreSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
