-- CreateIndex
CREATE INDEX "chats_user_id_idx" ON "chats"("user_id");

-- CreateIndex
CREATE INDEX "chats_user_id_updated_at_idx" ON "chats"("user_id", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "chats_id_user_id_idx" ON "chats"("id", "user_id");

-- CreateIndex
CREATE INDEX "messages_chat_id_idx" ON "messages"("chat_id");

-- CreateIndex
CREATE INDEX "messages_chat_id_created_at_idx" ON "messages"("chat_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at" DESC);
