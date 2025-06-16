-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateTable
CREATE TABLE "contacts" (
    "contact_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "extension_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("contact_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_extension_id_key" ON "contacts"("extension_id");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_extension_id_fkey" FOREIGN KEY ("extension_id") REFERENCES "extensions"("extension_id") ON DELETE SET NULL ON UPDATE CASCADE;
