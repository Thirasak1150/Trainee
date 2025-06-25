-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "Transporttype" AS ENUM ('UDP', 'TCP', 'TLS', 'WS', 'WSS');

-- CreateEnum
CREATE TYPE "TrunkType" AS ENUM ('Register', 'PEER', 'ACCOUNT', 'WEBRTC');

-- CreateTable
CREATE TABLE "roles" (
    "roles_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("roles_id")
);

-- CreateTable
CREATE TABLE "users" (
    "users_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "email" TEXT,
    "user_enabled" BOOLEAN NOT NULL DEFAULT true,
    "roles_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("users_id")
);

-- CreateTable
CREATE TABLE "domains" (
    "domains_id" UUID NOT NULL,
    "manager_id" UUID,
    "domain_name" TEXT NOT NULL,
    "enable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("domains_id")
);

-- CreateTable
CREATE TABLE "menu_headers" (
    "menu_headers_id" UUID NOT NULL,
    "name_default" TEXT NOT NULL,
    "name_custom" TEXT,
    "icon" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_headers_pkey" PRIMARY KEY ("menu_headers_id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "menu_items_id" UUID NOT NULL,
    "menu_headers_id" UUID NOT NULL,
    "name_default" TEXT NOT NULL,
    "name_custom" TEXT,
    "path" TEXT,
    "icon" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("menu_items_id")
);

-- CreateTable
CREATE TABLE "role_menus" (
    "roles_id" UUID NOT NULL,
    "menu_headers_id" UUID NOT NULL,

    CONSTRAINT "role_menus_pkey" PRIMARY KEY ("roles_id","menu_headers_id")
);

-- CreateTable
CREATE TABLE "role_menu_items" (
    "roles_id" UUID NOT NULL,
    "menu_items_id" UUID NOT NULL,

    CONSTRAINT "role_menu_items_pkey" PRIMARY KEY ("roles_id","menu_items_id")
);

-- CreateTable
CREATE TABLE "extensions" (
    "extension_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "group_id" UUID,
    "user_id" UUID,
    "extension_number" TEXT NOT NULL,
    "voicemail_enabled" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "call_forwarding" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extensions_pkey" PRIMARY KEY ("extension_id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "contact_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT,
    "contact_type" "ContactType" NOT NULL DEFAULT 'EXTERNAL',
    "extension_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("contact_id")
);

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

-- CreateTable
CREATE TABLE "trunks" (
    "trunk_id" UUID NOT NULL,
    "domain_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "transport" "Transporttype" NOT NULL DEFAULT 'UDP',
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 5060,
    "username" TEXT,
    "auth_username" TEXT,
    "password" TEXT,
    "register_trunk" BOOLEAN NOT NULL DEFAULT false,
    "trunk_type" "TrunkType" NOT NULL DEFAULT 'Register',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trunks_pkey" PRIMARY KEY ("trunk_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "domains_domain_name_key" ON "domains"("domain_name");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_extension_id_key" ON "contacts"("extension_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_headers_id_fkey" FOREIGN KEY ("menu_headers_id") REFERENCES "menu_headers"("menu_headers_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "roles"("roles_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_menu_headers_id_fkey" FOREIGN KEY ("menu_headers_id") REFERENCES "menu_headers"("menu_headers_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_items" ADD CONSTRAINT "role_menu_items_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "roles"("roles_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_menu_items" ADD CONSTRAINT "role_menu_items_menu_items_id_fkey" FOREIGN KEY ("menu_items_id") REFERENCES "menu_items"("menu_items_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extensions" ADD CONSTRAINT "extensions_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("domains_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extensions" ADD CONSTRAINT "extensions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group_extensions"("group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_extension_id_fkey" FOREIGN KEY ("extension_id") REFERENCES "extensions"("extension_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("domains_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_extensions" ADD CONSTRAINT "group_extensions_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("domains_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trunks" ADD CONSTRAINT "trunks_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domains"("domains_id") ON DELETE CASCADE ON UPDATE CASCADE;
