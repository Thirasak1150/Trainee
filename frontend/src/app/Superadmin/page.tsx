// (ภาษาไทย) กำหนดให้ไฟล์นี้ทำงานฝั่ง client (ในเบราว์เซอร์)
'use client';

// (ภาษาไทย) นำเข้า hook 'useRouter' จาก 'next/navigation' สำหรับการเปลี่ยนหน้า (navigation)
import { useRouter } from 'next/navigation';

// (ภาษาไทย) Export default function component ชื่อ SuperadminPage
export default function SuperadminPage() {
  // (ภาษาไทย) เรียกใช้ useRouter hook เพื่อเข้าถึง object 'router' สำหรับการ điều hướng
  const router = useRouter();

  // (ภาษาไทย) ฟังก์ชันสำหรับจัดการการออกจากระบบ
  const handleLogout = () => {
    // (ภาษาไทย) ล้าง cookie 'userRole' โดยตั้งค่าวันหมดอายุเป็นในอดีต
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    // (ภาษาไทย) เปลี่ยนเส้นทางผู้ใช้ไปยังหน้าหลัก (หน้า login)
    router.push('/');
  };

  // (ภาษาไทย) ส่วน JSX ที่จะ render UI ของหน้า Superadmin
  return (
    // (ภาษาไทย) Container หลักของหน้า, กำหนดความสูงขั้นต่ำ, สีพื้นหลังแบบไล่ระดับ, สีตัวอักษร, และการจัดวาง flex
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center p-4">
      {/* (ภาษาไทย) ส่วนหัวของหน้า */}
      <header className="w-full max-w-4xl py-6 flex justify-between items-center">
        {/* (ภาษาไทย) ชื่อหัวข้อหลักของ Dashboard, ใช้สีเหลืองอำพัน (amber) */}
        <h1 className="text-3xl font-bold text-amber-400">Superadmin Dashboard</h1>
        {/* (ภาษาไทย) ปุ่ม Logout */}
        <button
          onClick={handleLogout} // (ภาษาไทย) เมื่อคลิกปุ่มนี้ ให้เรียกฟังก์ชัน handleLogout
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out" // (ภาษาไทย) สไตล์ของปุ่ม Logout
        >
          Logout {/* (ภาษาไทย) ข้อความบนปุ่ม */}
        </button>
      </header>
      {/* (ภาษาไทย) ส่วนเนื้อหาหลักของหน้า */}
      <main className="w-full max-w-4xl mt-8 p-8 bg-slate-800 shadow-xl rounded-xl">
        {/* (ภาษาไทย) ข้อความต้อนรับ Superadmin */}
        <h2 className="text-2xl font-semibold text-slate-200 mb-4">Welcome, Superadmin!</h2>
        {/* (ภาษาไทย) คำอธิบายเกี่ยวกับ Superadmin panel */}
        <p className="text-slate-400">
          You have ultimate control over the entire system. Manage tenants, core settings, and advanced configurations.
        </p>
        {/* (ภาษาไทย) Placeholder สำหรับเนื้อหาเฉพาะของ Superadmin ในอนาคต */}
        <div className="mt-6 border-t border-slate-700 pt-6">
          {/* (ภาษาไทย) ข้อความ placeholder สำหรับโมดูลในอนาคต */}
          <p className="text-slate-500">Future modules: Tenant Management, Global System Settings, Security Audits, Core Service Configuration.</p>
        </div>
      </main>
      {/* (ภาษาไทย) ส่วนท้ายของหน้า */}
      <footer className="w-full max-w-4xl mt-auto py-6 text-center text-slate-500 text-sm">
        Powered by FusionPBX & Next.js {/* (ภาษาไทย) ข้อความลิขสิทธิ์หรือข้อมูลเพิ่มเติม */}
      </footer>
    </div>
  );
}