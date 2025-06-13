-- 1. Roles
INSERT INTO roles (roles_id, name, description) VALUES
  (gen_random_uuid(), 'Superadmin', 'Full Access'),
  (gen_random_uuid(), 'Admin', 'Admin Access'),
  (gen_random_uuid(), 'User', 'User Access');

-- ดึง roles_id ไว้ใช้งานต่อ
-- SELECT * FROM roles;

-- 2. Users
INSERT INTO users (users_id, username, password_hash, full_name, email, roles_id)
VALUES
  (gen_random_uuid(), 'superadmin', 'superadmin', 'Super Admin', 'superadmin@example.com', (SELECT roles_id FROM roles WHERE name = 'Superadmin')),
  (gen_random_uuid(), 'admin', 'admin', 'Admin User', 'admin@example.com', (SELECT roles_id FROM roles WHERE name = 'Admin')),
  (gen_random_uuid(), 'user', 'user', 'Normal User', 'user@example.com', (SELECT roles_id FROM roles WHERE name = 'User'));

-- 3. Menu Headers
INSERT INTO menu_headers (menu_headers_id, name_default, order_index)
VALUES
  (gen_random_uuid(), 'Home', 1),
  (gen_random_uuid(), 'Advance', 2);

-- ดึง menu_headers_id เพื่อใช้ต่อ
-- SELECT * FROM menu_headers;

-- 4. Menu Items
INSERT INTO menu_items (menu_items_id, menu_headers_id, name_default, path, order_index)
VALUES
  -- Home
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Account Setting', '/home/account-setting', 1),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Accounts', '/home/accounts', 2),
  -- Advance
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Access Controls', '/advance/access-controls', 1),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Domains', '/advance/domains', 2),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Menu Manager', '/advance/menu-manager', 3);

-- 5. Mapping Role ↔ Menu Headers
INSERT INTO role_menus (roles_id, menu_headers_id)
SELECT r.roles_id, h.menu_headers_id
FROM roles r, menu_headers h;

-- 6. Mapping Role ↔ Menu Items
INSERT INTO role_menu_items (roles_id, menu_items_id)
SELECT r.roles_id, i.menu_items_id
FROM roles r, menu_items i;
