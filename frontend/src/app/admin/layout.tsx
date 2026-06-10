"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const navItems = [
    { name: 'Live Orders', path: '/admin/orders' },
    { name: 'Menu Management', path: '/admin/menu' },
    { name: 'Table Management', path: '/admin/tables' },
    { name: 'Settings', path: '/admin/settings' }
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted || !token) return null; // Prevent hydration mismatch and hide content until auth checked

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-60 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col z-10">
        <div className="p-6">
          <h1 className="text-sm font-bold tracking-widest text-zinc-900 uppercase">Dollyva</h1>
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">Admin Portal</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`block px-4 py-2 text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-zinc-50 text-zinc-900 border-l-2 border-zinc-900 font-semibold' 
                    : 'text-zinc-500 hover:bg-zinc-50/50 hover:text-zinc-900 border-l-2 border-transparent'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-200">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors flex items-center gap-2 border-l-2 border-transparent cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-h-screen overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
}
