-- CreateEnum
CREATE TYPE "ChatMode" AS ENUM ('chat', 'mind');

-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('conversation', 'branching_point', 'insight');

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "is_collaborative" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mode" "ChatMode" NOT NULL DEFAULT 'chat',
ADD COLUMN     "template_id" TEXT;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "branch_name" TEXT,
ADD COLUMN     "is_collapsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "node_type" "NodeType" NOT NULL DEFAULT 'conversation',
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "x_position" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "y_position" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "conversation_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "structure" JSONB NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collaboration_sessions" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "participants" JSONB NOT NULL,
    "active_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaboration_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_insights" (
    "id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "insight_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversation_templates_creator_id_idx" ON "conversation_templates"("creator_id");

-- CreateIndex
CREATE INDEX "conversation_templates_is_public_idx" ON "conversation_templates"("is_public");

-- CreateIndex
CREATE INDEX "conversation_templates_created_at_idx" ON "conversation_templates"("created_at" DESC);

-- CreateIndex
CREATE INDEX "collaboration_sessions_chat_id_idx" ON "collaboration_sessions"("chat_id");

-- CreateIndex
CREATE INDEX "collaboration_sessions_last_activity_idx" ON "collaboration_sessions"("last_activity" DESC);

-- CreateIndex
CREATE INDEX "conversation_insights_chat_id_idx" ON "conversation_insights"("chat_id");

-- CreateIndex
CREATE INDEX "conversation_insights_message_id_idx" ON "conversation_insights"("message_id");

-- CreateIndex
CREATE INDEX "conversation_insights_insight_type_idx" ON "conversation_insights"("insight_type");

-- CreateIndex
CREATE INDEX "conversation_insights_created_at_idx" ON "conversation_insights"("created_at" DESC);

-- CreateIndex
CREATE INDEX "chats_mode_idx" ON "chats"("mode");

-- CreateIndex
CREATE INDEX "chats_template_id_idx" ON "chats"("template_id");

-- CreateIndex
CREATE INDEX "messages_parent_id_idx" ON "messages"("parent_id");

-- CreateIndex
CREATE INDEX "messages_model_idx" ON "messages"("model");

-- CreateIndex
CREATE INDEX "messages_node_type_idx" ON "messages"("node_type");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "conversation_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_sessions" ADD CONSTRAINT "collaboration_sessions_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_insights" ADD CONSTRAINT "conversation_insights_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_insights" ADD CONSTRAINT "conversation_insights_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
