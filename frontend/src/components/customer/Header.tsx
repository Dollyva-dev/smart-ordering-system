import { Icons } from './Icons';

interface HeaderProps {
  tableId: string;
  waiterCalled: boolean;
  cancelWaiter: () => void;
  handleCallWaiter: () => void;
}

export function Header({ tableId, waiterCalled, cancelWaiter, handleCallWaiter }: HeaderProps) {
  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-[#E0E6DF] sticky top-0 z-30 px-5 py-3.5 flex justify-between items-center shrink-0">
      <div className="flex flex-col">
        <h1 className="text-lg font-black tracking-tight text-[#1A2F1C] leading-tight flex items-center gap-1.5">
          <span className="text-[#2E6F40]">Dollyva</span>
        </h1>
        <span className="text-[10px] font-semibold text-[#6B7A68] uppercase tracking-wider">Smart Ordering</span>
      </div>

      <div className="flex items-center gap-2">
        {waiterCalled ? (
          <button 
            onClick={cancelWaiter}
            className="bg-[#E8F5E9] text-[#2E6F40] border border-[#C8E6C9] px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 animate-pulse cursor-pointer hover:bg-[#C8E6C9]/40 transition-colors"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E6F40] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2E6F40]"></span>
            </span>
            Cancel Bell
          </button>
        ) : (
          <button 
            onClick={handleCallWaiter}
            className="bg-[#FAF9F5] border border-[#E0E6DF] text-[#6B7A68] hover:text-[#2E6F40] hover:border-[#C8E6C9] px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Icons.Bell />
            Call Waiter
          </button>
        )}
        
        <div className="bg-[#E8F5E9] text-[#2E6F40] border border-[#C8E6C9] px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase">
          Table {tableId}
        </div>
      </div>
    </header>
  );
}
