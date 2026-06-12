import { Icons } from './Icons';

interface WaiterModalProps {
  waiterRequestStatus: 'idle' | 'selecting' | 'sending' | 'success';
  waiterReason: string;
  setWaiterReason: (reason: string) => void;
  setWaiterModalOpen: (open: boolean) => void;
  submitCallWaiter: () => void;
}

export function WaiterModal({
  waiterRequestStatus,
  waiterReason,
  setWaiterReason,
  setWaiterModalOpen,
  submitCallWaiter,
}: WaiterModalProps) {
  return (
    <div className="absolute inset-0 bg-[#1A2F1C]/45 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white w-full max-w-[320px] rounded-3xl p-6 shadow-2xl border border-[#E0E6DF] flex flex-col items-center text-center animate-scale-up">
        
        {waiterRequestStatus === 'selecting' && (
          <div className="space-y-4 w-full">
            <div className="w-12 h-12 bg-[#E8F5E9] text-[#2E6F40] rounded-full flex items-center justify-center mx-auto mb-2">
              <Icons.Bell />
            </div>
            <h3 className="font-extrabold text-sm.5 text-[#1A2F1C]">Need Assistance?</h3>
            <p className="text-[#6B7A68] text-xs font-semibold">Choose a reason below to notify your table assistant.</p>
            
            <div className="space-y-2">
              {[
                'General Assistance',
                'Request Water / Ice',
                'Order Assistance',
                'Clean Table Request',
                'Request Bill / Invoice'
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setWaiterReason(reason)}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-left ${
                    waiterReason === reason
                      ? 'border-[#2E6F40] bg-[#E8F5E9]/50 text-[#2E6F40]'
                      : 'border-[#E0E6DF] bg-white text-[#6B7A68] hover:border-[#C8E6C9]'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => setWaiterModalOpen(false)}
                className="flex-1 bg-[#FAF9F5] hover:bg-[#E8F5E9] text-[#6B7A68] border border-[#E0E6DF] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={submitCallWaiter}
                className="flex-1 bg-[#2E6F40] hover:bg-[#1D4A2A] text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Call Staff
              </button>
            </div>
          </div>
        )}

        {waiterRequestStatus === 'sending' && (
          <div className="py-8 flex flex-col items-center gap-4">
            {/* Radar Pulse Effect */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-[#2E6F40]/20 rounded-full animate-ping"></div>
              <div className="absolute w-8 h-8 bg-[#2E6F40]/40 rounded-full animate-pulse"></div>
              <div className="relative w-6 h-6 bg-[#2E6F40] rounded-full flex items-center justify-center text-white">
                <Icons.Bell />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm.5 text-[#1A2F1C]">Beaming Signal...</h3>
              <p className="text-[#6B7A68] text-xs font-semibold">Informing kitchen staff of your request.</p>
            </div>
          </div>
        )}

        {waiterRequestStatus === 'success' && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center animate-bounce">
              <Icons.Check />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm.5 text-[#1A2F1C]">Staff Notified!</h3>
              <p className="text-[#6B7A68] text-xs font-semibold max-w-[200px] leading-relaxed">
                A waiter is attending to your request: <strong className="text-[#2E6F40]">{waiterReason}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
