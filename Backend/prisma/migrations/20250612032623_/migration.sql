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
    "roles_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("users_id")
);

-- CreateTable
CREATE TABLE "domains" (
    "domains_id" UUID NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "domains_domain_name_key" ON "domains"("domain_name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "roles"("roles_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("users_id") ON DELETE SET NULL ON UPDATE CASCADE;

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
