-- AlterTable
ALTER TABLE "users" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "extensions" (
    "extension_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "user_id" UUID,
    "extension_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "voicemail_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "call_forwarding" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extensions_pkey" PRIMARY KEY ("extension_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "extensions_extension_number_key" ON "extensions"("extension_number");

-- AddForeignKey
ALTER TABLE "extensions" ADD CONSTRAINT "extensions_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("domains_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extensions" ADD CONSTRAINT "extensions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;
