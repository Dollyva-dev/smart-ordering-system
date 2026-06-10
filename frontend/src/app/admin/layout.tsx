"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Live Orders', path: '/admin/orders' },
    { name: 'Menu Management', path: '/admin/menu' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6">
          <h1 className="text-2xl font-black text-amber-500 tracking-tight">Dollyva Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive ? 'bg-amber-500 text-slate-900' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
