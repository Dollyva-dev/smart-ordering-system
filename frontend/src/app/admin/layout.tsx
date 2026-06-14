"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  MonitorSmartphone, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { DialogProvider } from '@/components/admin/DialogProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, logout } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Live Orders', path: '/admin/orders', icon: LayoutDashboard },
    { name: 'Menu Management', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Table Management', path: '/admin/tables', icon: MonitorSmartphone }
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted || !token) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-zinc-100">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              Dollyva<span className="text-blue-500">.</span>
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Workspace
            </span>
          </div>
          <button 
            className="lg:hidden text-zinc-400 hover:text-zinc-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10' 
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'}`} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Area / Logout */}
        <div className="p-4 border-t border-zinc-100 m-2 space-y-1.5">
          <Link 
            href="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group ${
              pathname.startsWith('/admin/settings') 
                ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/10' 
                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <Settings 
              size={18} 
              strokeWidth={pathname.startsWith('/admin/settings') ? 2.5 : 2} 
              className={`transition-colors ${pathname.startsWith('/admin/settings') ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'}`} 
            />
            Settings
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group cursor-pointer"
          >
            <LogOut size={18} strokeWidth={2.5} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-zinc-200 shadow-sm lg:hidden shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <span className="text-lg font-bold text-zinc-900 tracking-tight">Dollyva.</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <DialogProvider>
              {children}
            </DialogProvider>
          </div>
        </main>

      </div>
    </div>
  );
}