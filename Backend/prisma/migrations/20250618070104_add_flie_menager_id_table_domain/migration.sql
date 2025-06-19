-- DropForeignKey
ALTER TABLE "domains" DROP CONSTRAINT "domains_created_by_fkey";

-- AlterTable
ALTER TABLE "domains" ADD COLUMN     "manager_id" UUID;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;
