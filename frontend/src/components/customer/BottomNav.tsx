import { Icons } from './Icons';
import { Order } from '@/types/restaurant';

interface BottomNavProps {
  currentTab: 'menu' | 'cart' | 'orders';
  setCurrentTab: (tab: 'menu' | 'cart' | 'orders') => void;
  cartTotalQty: number;
  tableOrders: Order[];
  handleCallWaiter: () => void;
}

export function BottomNav({
  currentTab,
  setCurrentTab,
  cartTotalQty,
  tableOrders,
  handleCallWaiter,
}: BottomNavProps) {
  return (
    <nav className="sticky bottom-0 mt-auto left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#E0E6DF] px-4.5 flex justify-between items-center z-40 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      
      <button 
        onClick={() => setCurrentTab('menu')}
        className={`flex flex-col items-center justify-center gap-1 text-center py-2 flex-1 cursor-pointer transition-all ${
          currentTab === 'menu' ? 'text-[#2E6F40] scale-105 font-bold' : 'text-[#6B7A68] hover:text-[#2E6F40]'
        }`}
      >
        <Icons.Menu />
        <span className="text-[9.5px]">Menu</span>
      </button>

      <button 
        onClick={() => setCurrentTab('cart')}
        className={`flex flex-col items-center justify-center gap-1 text-center py-2 flex-1 cursor-pointer relative transition-all ${
          currentTab === 'cart' ? 'text-[#2E6F40] scale-105 font-bold' : 'text-[#6B7A68] hover:text-[#2E6F40]'
        }`}
      >
        <div className="relative">
          <Icons.Cart />
          {cartTotalQty > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#D32F2F] text-white border border-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-black animate-pulse">
              {cartTotalQty}
            </span>
          )}
        </div>
        <span className="text-[9.5px]">My Tray</span>
      </button>

      <button 
        onClick={() => setCurrentTab('orders')}
        className={`flex flex-col items-center justify-center gap-1 text-center py-2 flex-1 cursor-pointer relative transition-all ${
          currentTab === 'orders' ? 'text-[#2E6F40] scale-105 font-bold' : 'text-[#6B7A68] hover:text-[#2E6F40]'
        }`}
      >
        <div className="relative">
          <Icons.Orders />
          {tableOrders.some(o => o.status === 'pending' || o.status === 'preparing') && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#2E6F40] border border-white rounded-full animate-ping"></span>
          )}
        </div>
        <span className="text-[9.5px]">Kitchen Status</span>
      </button>

      <button 
        onClick={handleCallWaiter}
        className="flex flex-col items-center justify-center gap-1 text-center py-2 flex-1 cursor-pointer text-[#6B7A68] hover:text-[#2E6F40] transition-all"
      >
        <Icons.Bell />
        <span className="text-[9.5px]">Call Waiter</span>
      </button>
    </nav>
  );
}
