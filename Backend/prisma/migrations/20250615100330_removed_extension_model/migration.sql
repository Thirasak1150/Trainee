/*
  Warnings:

  - You are about to drop the column `password` on the `extensions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[domain_id,extension_number]` on the table `extensions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "extensions_extension_number_key";

-- AlterTable
ALTER TABLE "extensions" DROP COLUMN "password";

-- CreateIndex
CREATE UNIQUE INDEX "extensions_domain_id_extension_number_key" ON "extensions"("domain_id", "extension_number");
