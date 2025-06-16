-- DropForeignKey
ALTER TABLE "domains" DROP CONSTRAINT "domains_created_by_fkey";

-- DropForeignKey
ALTER TABLE "extensions" DROP CONSTRAINT "extensions_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "extensions" DROP CONSTRAINT "extensions_user_id_fkey";

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("users_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extensions" ADD CONSTRAINT "extensions_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("domains_id") ON DELETE CASCADE ON UPDATE CASCADE;
