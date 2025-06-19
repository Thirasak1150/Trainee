-- ================================
-- 🔥 1. ลบข้อมูลทั้งหมด
-- ================================
DELETE FROM role_menu_items;
DELETE FROM role_menus;
DELETE FROM menu_items;
DELETE FROM menu_headers;
DELETE FROM extensions;
DELETE FROM contacts;
DELETE FROM domains;
DELETE FROM users;
DELETE FROM roles;

-- ================================
-- ✅ 2. เพิ่มข้อมูล Roles
-- ================================
INSERT INTO roles (roles_id, name, description) VALUES
  (gen_random_uuid(), 'Superadmin', 'Full Access'),
  (gen_random_uuid(), 'Admin', 'Admin Access'),
  (gen_random_uuid(), 'User', 'User Access');

-- ================================
-- ✅ 3. เพิ่มข้อมูล Users
-- ================================
INSERT INTO users (users_id, username, password_hash, full_name, email, roles_id)
VALUES
  (gen_random_uuid(), 'superadmin', 'superadmin', 'Super Admin', 'superadmin@example.com', (SELECT roles_id FROM roles WHERE name = 'Superadmin')),
  (gen_random_uuid(), 'admin', 'admin', 'Admin User', 'admin@example.com', (SELECT roles_id FROM roles WHERE name = 'Admin')),
  (gen_random_uuid(), 'user', 'user', 'Normal User', 'user@example.com', (SELECT roles_id FROM roles WHERE name = 'User'));

-- ================================
-- ✅ 4. เพิ่มข้อมูล Domains
-- ================================
INSERT INTO domains (domains_id, domain_name, enable, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'companyA.com', true, now(), now()),
  (gen_random_uuid(), 'companyB.com', true, now(), now());

-- ================================
-- ✅ 5. เพิ่ม Menu Headers
-- ================================
INSERT INTO menu_headers (menu_headers_id, name_default, order_index)
VALUES
  (gen_random_uuid(), 'Home', 1),
  (gen_random_uuid(), 'Advance', 2),
  (gen_random_uuid(), 'Application', 3);

-- ================================
-- ✅ 6. เพิ่ม Menu Items
-- ================================
INSERT INTO menu_items (menu_items_id, menu_headers_id, name_default, path, order_index, icon)
VALUES
  -- Home
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Account Setting', '/home/account-setting', 1, 'account-setting'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Accounts', '/home/accounts', 2, 'accounts'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Extensions', '/home/extensions', 3, 'extensions'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Extension Setting', '/home/extension-setting', 4, 'extension-setting'),
  -- Advance
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Access Controls', '/advance/access-controls', 1, 'access-controls'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Domains', '/advance/domains', 2, 'domains'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Menu Manager', '/advance/menu-manager', 3, 'menu-manager'),
  -- Application
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Application'), 'Contacts', '/application/contacts', 1, 'contacts');

-- ================================
-- ✅ 7. Mapping Role ↔ Menu Headers
-- ================================
INSERT INTO role_menus (roles_id, menu_headers_id)
SELECT r.roles_id, h.menu_headers_id
FROM roles r, menu_headers h;

-- ================================
-- ✅ 8. Mapping Role ↔ Menu Items
-- ================================
INSERT INTO role_menu_items (roles_id, menu_items_id)
SELECT r.roles_id, i.menu_items_id
FROM roles r, menu_items i;

-- ================================
-- ✅ 9. เพิ่ม Extension
-- ================================
INSERT INTO extensions (
  extension_id,
  domain_id,
  user_id,
  extension_number,
  voicemail_enabled,
  is_active,
  call_forwarding,
  description,
  created_at,
  updated_at
)
VALUES
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'),
    (SELECT users_id FROM users WHERE username = 'superadmin'),
    '1001',
    true,
    true,
    '0912345678',
    'Extension of Super Admin',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'),
    (SELECT users_id FROM users WHERE username = 'admin'),
    '1002',
    false,
    true,
    NULL,
    'Extension of Admin',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyB.com'),
    (SELECT users_id FROM users WHERE username = 'user'),
    '2001',
    false,
    true,
    '0890000000',
    'Extension of Normal User',
    now(),
    now()
  );

-- ================================
-- ✅ 10. เพิ่มข้อมูล Contacts
-- ================================
INSERT INTO contacts (
  contact_id,
  full_name,
  phone_number,
  extension_id,
  created_at,
  updated_at
)
VALUES
  (
    gen_random_uuid(),
    'John Doe',
    '0812345678',
    (SELECT extension_id FROM extensions WHERE extension_number = '1001' AND domain_id = (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com')),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Jane Admin',
    '0823456789',
    (SELECT extension_id FROM extensions WHERE extension_number = '1002' AND domain_id = (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com')),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Normal User Contact',
    '0834567890',
    (SELECT extension_id FROM extensions WHERE extension_number = '2001' AND domain_id = (SELECT domains_id FROM domains WHERE domain_name = 'companyB.com')),
    now(),
    now()
  );

-- ================================
-- ✅ 11. ตั้ง Admin เป็นเจ้าของ domain companyA.com
-- ================================
UPDATE domains
SET 
  manager_id = (SELECT users_id FROM users WHERE username = 'admin'),
  created_by = (SELECT users_id FROM users WHERE username = 'admin'),
  updated_by = (SELECT users_id FROM users WHERE username = 'admin'),
  updated_at = now()
WHERE domain_name = 'companyA.com';

-- ================================
-- 🎉 เสร็จสมบูรณ์!
-- ================================
