-- ================================
-- 🔥 1. ลบข้อมูลทั้งหมด (ถ้ามีความสัมพันธ์ ให้ลบตามลำดับ)
-- ================================
DELETE FROM role_menu_items;
DELETE FROM role_menus;
DELETE FROM menu_items;
DELETE FROM menu_headers;
DELETE FROM extensions;
DELETE FROM contacts;
DELETE FROM group_extensions;
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
-- ✅ 5. เพิ่มข้อมูล Group Extensions (กลุ่ม)
-- ================================
INSERT INTO group_extensions (group_id, domain_id, name, description, is_active, created_at, updated_at)
VALUES
  (gen_random_uuid(), (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'), 'IT', 'IT Department', true, now(), now()),
  (gen_random_uuid(), (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'), 'Accounting', 'Accounting Department', true, now(), now()),
  (gen_random_uuid(), (SELECT domains_id FROM domains WHERE domain_name = 'companyB.com'), 'HR', 'Human Resources', true, now(), now());

-- ================================
-- ✅ 6. เพิ่ม Menu Headers
-- ================================
INSERT INTO menu_headers (menu_headers_id, name_default, order_index)
VALUES
  (gen_random_uuid(), 'Home', 1),
  (gen_random_uuid(), 'Advance', 2),
  (gen_random_uuid(), 'Application', 3);

-- ================================
-- ✅ 7. เพิ่ม Menu Items
-- ================================
INSERT INTO menu_items (menu_items_id, menu_headers_id, name_default, path, order_index, icon)
VALUES
  -- Home
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Account Setting', '/home/account-setting', 1, 'account-setting'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Accounts', '/home/accounts', 2, 'accounts'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Extensions', '/home/extensions', 3, 'extensions'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Extension Setting', '/home/extension-setting', 4, 'extension-setting'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Group Extensions', '/home/group-extensions', 5, 'group-extensions'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Home'), 'Trunks', '/home/trunks', 6, 'trunks'),
  -- Advance
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Access Controls', '/advance/access-controls', 1, 'access-controls'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Domains', '/advance/domains', 2, 'domains'),
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Advance'), 'Menu Manager', '/advance/menu-manager', 3, 'menu-manager'),
  -- Application
  (gen_random_uuid(), (SELECT menu_headers_id FROM menu_headers WHERE name_default = 'Application'), 'Contacts', '/application/contacts', 1, 'contacts');

-- ================================
-- ✅ 8. Mapping Role ↔ Menu Headers
-- ================================
INSERT INTO role_menus (roles_id, menu_headers_id)
SELECT r.roles_id, h.menu_headers_id
FROM roles r, menu_headers h;

-- ================================
-- ✅ 9. Mapping Role ↔ Menu Items
-- ================================
INSERT INTO role_menu_items (roles_id, menu_items_id)
SELECT r.roles_id, i.menu_items_id
FROM roles r, menu_items i;

-- ================================
-- ✅ 10. เพิ่ม Extensions พร้อมเชื่อม group_id
-- ================================
INSERT INTO extensions (
  extension_id,
  domain_id,
  group_id,
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
    (SELECT group_id FROM group_extensions WHERE name = 'IT' AND domain_id = (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com')),
    (SELECT users_id FROM users WHERE username = 'superadmin'),
    '1001',
    true,
    true,
    '0912345678',
    'Extension of Super Admin in IT Group',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'),
    (SELECT group_id FROM group_extensions WHERE name = 'Accounting' AND domain_id = (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com')),
    (SELECT users_id FROM users WHERE username = 'admin'),
    '1002',
    false,
    true,
    NULL,
    'Extension of Admin in Accounting Group',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyB.com'),
    (SELECT group_id FROM group_extensions WHERE name = 'HR' AND domain_id = (SELECT domains_id FROM domains WHERE domain_name = 'companyB.com')),
    (SELECT users_id FROM users WHERE username = 'user'),
    '2001',
    false,
    true,
    '0890000000',
    'Extension of Normal User in HR Group',
    now(),
    now()
  );

-- ================================
-- ✅ 11. เพิ่มข้อมูล Contacts
-- ================================
INSERT INTO contacts (
  contact_id,
  domain_id,
  full_name,
  phone_number,
  contact_type,
  extension_id,
  created_at,
  updated_at
)
VALUES
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'),
    'John Doe',
    '0812345678',
    'INTERNAL',
    (SELECT extension_id FROM extensions WHERE extension_number = '1001'),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'),
    'Jane Admin',
    '0823456789',
    'EXTERNAL',
    (SELECT extension_id FROM extensions WHERE extension_number = '1002'),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyB.com'),
    'Normal User Contact',
    '0834567890',
    'EXTERNAL',
    (SELECT extension_id FROM extensions WHERE extension_number = '2001'),
    now(),
    now()
  );


-- ================================
-- ✅ 12. ตั้ง Admin เป็นเจ้าของ domain companyA.com
-- ================================
UPDATE domains
SET 
  manager_id = (SELECT users_id FROM users WHERE username = 'admin'),
  created_by = (SELECT users_id FROM users WHERE username = 'admin'),
  updated_by = (SELECT users_id FROM users WHERE username = 'admin'),
  updated_at = now()
WHERE domain_name = 'companyA.com';

-- ================================
-- ✅ 13. เพิ่มข้อมูล Trunks
-- ================================
INSERT INTO trunks (
  trunk_id,
  domain_id,
  name,
  transport,
  host,
  port,
  username,
  auth_username,
  password,
  register_trunk,
  trunk_type,
  is_active,
  description,
  created_at,
  updated_at
)
VALUES
  -- SIP Trunk สำหรับ TOT
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'),
    'TOT SIP Trunk',
    'UDP',
    'sip.tot.co.th',
    5060,
    '0812345678',
    '0812345678',
    'tot1234',
    true,
    'Register',
    true,
    'TOT SIP Trunk สำหรับโทรออกนอก',
    now(),
    now()
  ),
  -- GSM Gateway
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'),
    'GSM Gateway 1',
    'TCP',
    '192.168.1.100',
    5060,
    'admin',
    'admin',
    'gsm1234',
    false,
    'PEER',
    true,
    'GSM Gateway สำหรับโทรออกมือถือ',
    now(),
    now()
  ),
  -- Trunk สำหรับ Company B
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyB.com'),
    'Company B Main Trunk',
    'TLS',
    'sip.companyb.com',
    5061,
    'companyb',
    'companyb',
    'securepass123',
    true,
    'Register',
    true,
    'Main SIP Trunk for Company B',
    now(),
    now()
  ),
  -- WebRTC Trunk
  (
    gen_random_uuid(),
    (SELECT domains_id FROM domains WHERE domain_name = 'companyA.com'),
    'WebRTC Gateway',
    'WSS',
    'webrtc.example.com',
    7443,
    'webrtc',
    'webrtc',
    'webrtcpass',
    true,
    'WEBRTC',
    true,
    'WebRTC Gateway สำหรับการเชื่อมต่อผ่าน Browser',
    now(),
    now()
  );
-- ================================
-- 🎉 เสร็จสมบูรณ์!
-- ================================
