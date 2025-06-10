import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // (ภาษาไทย) ดึงค่า cookie ที่ชื่อว่า userRole
  const userRoleCookie = request.cookies.get('userRole');
  let rawUserRole = userRoleCookie?.value;
  let processedUserRole: string | undefined = undefined;

  // (ภาษาไทย) แปลงค่าจาก cookie ให้เป็นรูปแบบที่ใช้ได้ (user, admin, superadmin)
  // (ภาษาไทย) ไม่ต้องแปลงเป็นตัวพิมพ์ใหญ่ตัวแรกแล้ว เพราะ Navbar และ DashboardPage ใช้ตัวพิมพ์เล็ก
  if (rawUserRole) {
    const roleLower = rawUserRole.toLowerCase();
    if (['user', 'admin', 'superadmin'].includes(roleLower)) {
      processedUserRole = roleLower;
    }
  }

  const currentUserRole = processedUserRole;
  const loginPath = '/'; // (ภาษาไทย) หน้าหลักคือหน้า login
  const dashboardPath = '/Dashbord'; // (ภาษาไทย) หน้า Dashboard ใหม่สำหรับทุก role

  // (ภาษาไทย) Path ที่เคยเป็นของแต่ละ role (ตอนนี้จะ redirect ไป /Dashbord)
  const oldRoleSpecificPaths = ['/User', '/Admin', '/Superadmin'];

  if (!currentUserRole) {
    // (ภาษาไทย) --- ผู้ใช้ยังไม่ได้ Login ---
    if (pathname === loginPath) {
      // (ภาษาไทย) ถ้าอยู่ที่หน้า Login อยู่แล้ว ก็อนุญาต
      return NextResponse.next();
    }
    // (ภาษาไทย) ถ้าพยายามเข้าหน้า Dashboard หรือ path อื่นๆ ที่ไม่ใช่หน้า Login ให้ redirect ไปหน้า Login
    console.log(`Unauthenticated user trying to access ${pathname}, redirecting to login.`);
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  // (ภาษาไทย) --- ผู้ใช้ Login แล้ว (มี currentUserRole) ---

  // (ภาษาไทย) ตรวจสอบว่า role ที่ได้จาก cookie ถูกต้องหรือไม่
  if (!['user', 'admin', 'superadmin'].includes(currentUserRole)) {
    // (ภาษาไทย) ถ้า role จาก cookie ไม่ถูกต้อง → ลบ cookie และ redirect ไปหน้า login
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete('userRole');
    console.log('Invalid role in cookie, redirecting to login and clearing cookie.');
    return response;
  }

  // (ภาษาไทย) ถ้าผู้ใช้ที่ Login แล้วอยู่ที่หน้า Login
  if (pathname === loginPath) {
    console.log(`User ${currentUserRole} on login page, redirecting to ${dashboardPath}`);
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // (ภาษาไทย) ถ้าผู้ใช้ที่ Login แล้วพยายามเข้า path ของ role แบบเก่า
  if (oldRoleSpecificPaths.some(oldPath => pathname === oldPath || pathname.startsWith(oldPath + '/'))) {
    console.log(`User ${currentUserRole} trying to access old role path ${pathname}, redirecting to ${dashboardPath}`);
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }
  
  // (ภาษาไทย) ถ้าผู้ใช้ที่ Login แล้วกำลังเข้าถึง path ที่อนุญาต
  // (ภาษาไทย) ทำให้ path ทั้งหมดเป็นตัวพิมพ์เล็กเพื่อการเปรียบเทียบที่สอดคล้องกัน
  const normalizedPathname = pathname.toLowerCase();
  // (ภาษาไทย) กำหนดรายการ path ที่อนุญาต (เป็นตัวพิมพ์เล็ก และไม่ซ้ำซ้อน)
  // (ภาษาไทย) dashboardPath ถูกแปลงเป็น lowercase แล้ว
  const normalizedAllowedBasePaths = [
    "/dashbord",      // (ภาษาไทย) หน้า Dashboard หลัก (ตัวพิมพ์เล็ก)
    "/domain",        // (ภาษาไทย) อนุญาต /domain และ subpaths เช่น /domain/manage
    "/useraccess",    // (ภาษาไทย) อนุญาต /useraccess และ subpaths เช่น /useraccess/roles
    "/usersettings"   // (ภาษาไทย) อนุญาต /usersettings และ subpaths เช่น /usersettings/profile
  ];

  // (ภาษาไทย) แสดงค่าตัวแปรเพื่อการดีบัก
  console.log("Current Path (normalized):", normalizedPathname);
  console.log("Allowed Base Paths (explicitly defined, normalized):", normalizedAllowedBasePaths);

  // (ภาษาไทย) ตรวจสอบว่า path ปัจจุบันเริ่มต้นด้วยหนึ่งใน path ที่อนุญาตหรือไม่ (พร้อม logging โดยละเอียด)
  console.log(`Preparing to check if '${normalizedPathname}' starts with any of: ${JSON.stringify(normalizedAllowedBasePaths)}`);
  const isPathAllowed = normalizedAllowedBasePaths.some(
    allowedBase => {
      const check = normalizedPathname.startsWith(allowedBase);
      console.log(`- Checking if '${normalizedPathname}' starts with '${allowedBase}': ${check}`);
      return check;
    }
  );
  console.log("Is Path Allowed (after .some check):", isPathAllowed);

  if (isPathAllowed) {
    console.log(`User ${currentUserRole} accessing ${pathname} (normalized to ${normalizedPathname}), allowing.`);
    return NextResponse.next();
  }

  // (ภาษาไทย) กรณี fallback: ถ้าผู้ใช้ Login แล้ว แต่เข้า path ที่ไม่รู้จัก/ไม่ตรงกับเงื่อนไขข้างต้น
  // (ภาษาไทย) ให้ redirect ไปที่ Dashboard หลักของเขา
  // (ภาษาไทย) (อาจจะไม่จำเป็นมากนักถ้า matcher ครอบคลุมดีแล้ว แต่ใส่ไว้เพื่อความปลอดภัย)
  console.log(`User ${currentUserRole} on unhandled path ${pathname}, redirecting to ${dashboardPath}`);
  return NextResponse.redirect(new URL(dashboardPath, request.url));
}

export const config = {
  matcher: [
    /*
     * ใช้กับทุก path ยกเว้น path ที่ขึ้นต้นด้วย:
     * - api (route สำหรับ API)
     * - _next/static (ไฟล์ static)
     * - _next/image (ไฟล์รูปภาพที่ optimize แล้ว)
     * - favicon.ico (ไอคอนของเว็บ)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
