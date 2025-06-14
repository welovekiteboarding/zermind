/*
  Warnings:

  - Made the column `attachments` on table `messages` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('owner', 'collaborator', 'viewer');

-- AlterTable
ALTER TABLE "collaboration_sessions" ADD COLUMN     "max_participants" INTEGER,
ADD COLUMN     "settings" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "edited_at" TIMESTAMP(3),
ADD COLUMN     "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_edited_by" TEXT,
ALTER COLUMN "attachments" SET NOT NULL;

-- AlterTable
ALTER TABLE "session_participants" ADD COLUMN     "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "ParticipantRole" NOT NULL DEFAULT 'collaborator';

-- CreateIndex
CREATE INDEX "messages_last_edited_by_idx" ON "messages"("last_edited_by");

-- CreateIndex
CREATE INDEX "messages_is_locked_idx" ON "messages"("is_locked");

-- CreateIndex
CREATE INDEX "session_participants_last_activity_idx" ON "session_participants"("last_activity" DESC);

-- CreateIndex
CREATE INDEX "session_participants_role_idx" ON "session_participants"("role");
