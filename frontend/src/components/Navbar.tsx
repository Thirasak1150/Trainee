'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // ดึงค่า userRole จาก cookie
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('userRole='))
      ?.split('=')[1];
    if (cookieValue) {
      setUserRole(cookieValue.toLowerCase()); // เก็บ role เป็นตัวพิมพ์เล็ก เช่น 'user', 'admin', 'superadmin'
    }
  }, []);

  const handleLogout = () => {
    // ล้าง cookie 'userRole'
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    // เปลี่ยนเส้นทางไปยังหน้า login
    router.push('/');
  };

  return (
    <nav className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/Dashbord" className="text-xl font-bold hover:text-sky-400">
          FusionPBX Dashboard
        </Link>
        <div className="space-x-4">
          {/* Links ทั่วไปสำหรับทุกคน */}
          <Link href="/Dashbord" className="hover:text-sky-300">Home</Link>

          {/* Links สำหรับ Admin และ Superadmin */}
          {(userRole === 'admin' ) && (
            <Link href="/Dashbord/admin-section" className="hover:text-emerald-300">
              Admin Panel
            </Link>
          )}

          {/* Links สำหรับ Superadmin เท่านั้น */}
          {userRole === 'superadmin' && (
            <Link href="/Dashbord/superadmin-section" className="hover:text-amber-300">
              Superadmin Tools
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg text-sm transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;