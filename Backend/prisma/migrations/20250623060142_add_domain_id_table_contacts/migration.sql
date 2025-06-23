/*
  Warnings:

  - Added the required column `domain_id` to the `contacts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "domain_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("domains_id") ON DELETE CASCADE ON UPDATE CASCADE;
