import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Chrome DevTools and similar requests to .well-known
  if (pathname.startsWith('/.well-known')) {
    return NextResponse.next();
  }

  // (ภาษาไทย) ดึงค่า cookie ที่ชื่อว่า userRole
  const userRoleCookie = request.cookies.get('userRole');
  const rawUserRole = userRoleCookie?.value;
  let processedUserRole: string | undefined = undefined;

  // (ภาษาไทย) แปลงค่าจาก cookie ให้เป็นรูปแบบที่ใช้ได้ (user, admin, superadmin)
  // (ภาษาไทย) ไม่ต้องแปลงเป็นตัวพิมพ์ใหญ่ตัวแรกแล้ว เพราะ Navbar และ DashboardPage ใช้ตัวพิมพ์เล็ก
  if (rawUserRole) {
    const roleLower = rawUserRole.toLowerCase();
    if (['user', 'admin', 'superadmin', 'advance'].includes(roleLower)) {
      processedUserRole = roleLower;
    }
  }
  
  console.log("processedUserRole", processedUserRole);
  const currentUserRole = processedUserRole;
  const loginPath = '/'; // หน้าหลักคือหน้า login
  const dashboardPath = '/dashboard'; // แก้ไขจาก /Dashbord เป็น /dashboard

  // Path ที่เคยเป็นของแต่ละ role (ตอนนี้จะ redirect ไป /dashboard)
  const oldRoleSpecificPaths = ['/User', '/Admin', '/Superadmin'];

  if (!currentUserRole) {
    // ผู้ใช้ยังไม่ได้ Login
    if (pathname === loginPath) {
      // ถ้าอยู่ที่หน้า Login อยู่แล้ว ก็อนุญาต
      return NextResponse.next();
    }
    // ถ้าพยายามเข้าหน้า Dashboard หรือ path อื่นๆ ที่ไม่ใช่หน้า Login ให้ redirect ไปหน้า Login
    console.log(`Unauthenticated user trying to access ${pathname}, redirecting to login.`);
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

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
  const normalizedAllowedBasePaths = [
    "/dashboard",
    "/domain",
    "/useraccess",
    "/usersettings",
    "/advance",
    "/advance/access-controls",
    "/advance/domains",
    "/advance/menu-manager",
    "/home",
    "/home/account-setting",
    "/home/accounts",
    "/home/extensions"
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
  if (pathname.startsWith('/Animation/') || pathname.endsWith('.mp4')) {
    console.log("Amationn true")
    return NextResponse.next();
  }
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
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.mp4$).*)',
  ],
};
