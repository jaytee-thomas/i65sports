/*
  Warnings:

  - You are about to drop the column `articleId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `fanReelId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `fanReelId` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FanReel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RecordingDraft` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reply` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `takeId` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `takeId` on table `Reaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Article" DROP CONSTRAINT "Article_columnistId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_articleId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_fanReelId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_takeId_fkey";

-- DropForeignKey
ALTER TABLE "FanReel" DROP CONSTRAINT "FanReel_authorId_fkey";

-- DropForeignKey
ALTER TABLE "FanReel" DROP CONSTRAINT "FanReel_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_fanReelId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_takeId_fkey";

-- DropForeignKey
ALTER TABLE "RecordingDraft" DROP CONSTRAINT "RecordingDraft_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Reply" DROP CONSTRAINT "Reply_takeId_fkey";

-- DropIndex
DROP INDEX "Reaction_fanReelId_userId_emoji_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "articleId",
DROP COLUMN "fanReelId",
ALTER COLUMN "takeId" SET NOT NULL;

-- AlterTable
ALTER TABLE "HotTake" ADD COLUMN     "gameId" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "recordedAtVenue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shotAt" TIMESTAMP(3),
ADD COLUMN     "thumbUrl" TEXT,
ADD COLUMN     "venueLat" DOUBLE PRECISION,
ADD COLUMN     "venueLng" DOUBLE PRECISION,
ADD COLUMN     "venueName" TEXT,
ADD COLUMN     "width" INTEGER;

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "fanReelId",
ALTER COLUMN "takeId" SET NOT NULL;

-- DropTable
DROP TABLE "Article";

-- DropTable
DROP TABLE "FanReel";

-- DropTable
DROP TABLE "RecordingDraft";

-- DropTable
DROP TABLE "Reply";

-- DropEnum
DROP TYPE "RecordingStatus";

-- DropEnum
DROP TYPE "ReelStatus";

-- DropEnum
DROP TYPE "ReplyKind";

-- CreateIndex
CREATE INDEX "Comment_takeId_createdAt_idx" ON "Comment"("takeId", "createdAt");

-- CreateIndex
CREATE INDEX "HotTake_createdAt_idx" ON "HotTake"("createdAt");

-- CreateIndex
CREATE INDEX "HotTake_recordedAtVenue_createdAt_idx" ON "HotTake"("recordedAtVenue", "createdAt");

-- CreateIndex
CREATE INDEX "HotTake_gameId_shotAt_idx" ON "HotTake"("gameId", "shotAt");

-- CreateIndex
CREATE INDEX "HotTake_league_createdAt_idx" ON "HotTake"("league", "createdAt");

-- AddForeignKey
ALTER TABLE "HotTake" ADD CONSTRAINT "HotTake_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_takeId_fkey" FOREIGN KEY ("takeId") REFERENCES "HotTake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_takeId_fkey" FOREIGN KEY ("takeId") REFERENCES "HotTake"("id") ON DELETE CASCADE ON UPDATE CASCADE;
