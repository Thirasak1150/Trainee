-- DropIndex
DROP INDEX "extensions_domain_id_extension_number_key";

-- AlterTable
ALTER TABLE "extensions" ADD COLUMN     "group_id" UUID;

-- CreateTable
CREATE TABLE "group_extensions" (
    "group_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_extensions_pkey" PRIMARY KEY ("group_id")
);

-- AddForeignKey
ALTER TABLE "extensions" ADD CONSTRAINT "extensions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group_extensions"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_extensions" ADD CONSTRAINT "group_extensions_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("domains_id") ON DELETE CASCADE ON UPDATE CASCADE;
