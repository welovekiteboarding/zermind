-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encrypted_key" TEXT NOT NULL,
    "key_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");

-- CreateIndex
CREATE INDEX "api_keys_user_id_provider_idx" ON "api_keys"("user_id", "provider");

-- CreateIndex
CREATE INDEX "api_keys_user_id_is_active_idx" ON "api_keys"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_user_id_provider_key_name_key" ON "api_keys"("user_id", "provider", "key_name");
