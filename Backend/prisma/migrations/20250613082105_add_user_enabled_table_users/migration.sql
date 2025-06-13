-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roles_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "user_enabled" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;
