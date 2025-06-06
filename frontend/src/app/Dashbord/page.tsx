'use client';

import Navbar from '@/components/Navbar'; 
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User'); 

  useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('userRole='))
      ?.split('=')[1];

    if (cookieValue) {
      const role = cookieValue.toLowerCase();
      setUserRole(role);
      if (role === 'admin') {
        setUserName('Admin');
      } else if (role === 'superadmin') {
        setUserName('Superadmin');
      } else {
        setUserName('User'); 
      }
    }
  }, []);

  const renderRoleSpecificContent = () => {
    if (userRole === 'admin') {
      return (
        <div>
          <h3 className="text-xl font-semibold text-emerald-400 mb-3">Admin Controls</h3>
          <p className="text-slate-400">Manage users, system settings, and monitor activity.</p>
          {/* เพิ่ม components หรือ links สำหรับ admin ที่นี่ */}
        </div>
      );
    }
    if (userRole === 'superadmin') {
      return (
        <div>
          <h3 className="text-xl font-semibold text-amber-400 mb-3">Superadmin Powers</h3>
          <p className="text-slate-400">Full system oversight, tenant management, and core configurations.</p>
          {/* เพิ่ม components หรือ links สำหรับ superadmin ที่นี่ */}
        </div>
      );
    }
    return (
      <div>
        <h3 className="text-xl font-semibold text-sky-400 mb-3">User Dashboard</h3>
        <p className="text-slate-400">Access your services and manage your profile.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col">
      <Navbar /> 
      <main className="flex-grow container mx-auto p-6 mt-4">
        <div className="bg-slate-800 shadow-xl rounded-xl p-8">
          <h2 className="text-3xl font-bold text-slate-200 mb-6">
            Welcome, <span className={
              userRole === 'admin' ? 'text-emerald-400' :
              userRole === 'superadmin' ? 'text-amber-400' : 'text-sky-400'
            }>{userName}!</span>
          </h2>
          
          {renderRoleSpecificContent()}

          <div className="mt-8 border-t border-slate-700 pt-6">
            <p className="text-slate-500 text-sm">
              This is your central hub. Navigate using the links above.
              Your current role is: <strong className="capitalize">{userRole || 'Not identified'}</strong>.
            </p>
          </div>
        </div>
      </main>
      <footer className="w-full py-6 text-center text-slate-500 text-sm">
        Powered by FusionPBX & Next.js
      </footer>
    </div>
  );
}