/*
  Warnings:

  - You are about to drop the column `participants` on the `collaboration_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "collaboration_sessions" DROP COLUMN "participants";

-- CreateTable
CREATE TABLE "session_participants" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_participants_session_id_idx" ON "session_participants"("session_id");

-- CreateIndex
CREATE INDEX "session_participants_user_id_idx" ON "session_participants"("user_id");

-- CreateIndex
CREATE INDEX "session_participants_joined_at_idx" ON "session_participants"("joined_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_session_id_user_id_key" ON "session_participants"("session_id", "user_id");

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "collaboration_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
