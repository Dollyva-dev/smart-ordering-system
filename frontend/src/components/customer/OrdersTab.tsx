import { Icons } from './Icons';
import { Order } from '@/types/restaurant';

interface OrdersTabProps {
  tableOrders: Order[];
  setWaiterReason: (reason: string) => void;
  submitCallWaiter: () => void;
}

export function OrdersTab({ tableOrders, setWaiterReason, submitCallWaiter }: OrdersTabProps) {
  return (
    <div className="px-5 py-5 flex flex-col min-h-full">
      <h2 className="text-base font-black text-[#1A2F1C] mb-1">Kitchen Status</h2>
      <p className="text-[#6B7A68] text-xs font-semibold mb-6">Track your table's food preparations live.</p>

      {tableOrders.length === 0 ? (
        <div className="flex-1 py-16 flex flex-col items-center justify-center text-center bg-white border border-[#E0E6DF] rounded-3xl p-6 shadow-sm">
          <div className="w-16 h-16 bg-[#E8F5E9] text-[#2E6F40] rounded-full flex items-center justify-center mb-4">
            <Icons.Orders />
          </div>
          <h3 className="font-bold text-sm text-[#1A2F1C] mb-1">No orders yet</h3>
          <p className="text-[#6B7A68] text-xs font-semibold max-w-[200px] leading-relaxed">Place an order from your tray, and you'll see preparation status updates here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Status Helper Notice */}
          <div className="bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E6F40] px-4 py-3 rounded-2xl text-[11px] font-semibold leading-relaxed flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E6F40] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E6F40]"></span>
            </span>
            <span>This page listens for kitchen notifications. Keep this open!</span>
          </div>

          {tableOrders.map((order, orderIdx) => {
            const statusConfig = {
              pending: { text: 'Waiting for kitchen', style: 'border-[#FFE0B2] text-[#B7791F] bg-[#FFFDF5]', dot: 'bg-amber-500' },
              preparing: { text: 'Chef is cooking', style: 'border-[#C8E6C9] text-[#2E6F40] bg-[#E8F5E9]', dot: 'bg-emerald-600' },
              served: { text: 'Served & Ready', style: 'border-blue-200 text-blue-800 bg-blue-50', dot: 'bg-blue-600' },
              cancelled: { text: 'Cancelled', style: 'border-rose-200 text-rose-800 bg-rose-50', dot: 'bg-rose-600' }
            };

            const config = statusConfig[order.status] || statusConfig.pending;

            return (
              <div key={order._id} className="bg-white rounded-3xl border border-[#E0E6DF] p-4.5 shadow-sm space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#8A9B86] uppercase tracking-widest">Order ID</span>
                    <h4 className="font-extrabold text-xs.5 text-[#1A2F1C]">#{order._id.substring(order._id.length - 6).toUpperCase()}</h4>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[9px] font-semibold text-[#8A9B86]">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${config.style}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`}></span>
                      {config.text}
                    </span>
                  </div>
                </div>

                {/* Order Items List */}
                <div className="border-y border-[#E0E6DF] py-3.5 space-y-2">
                  {order.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex justify-between text-xs leading-normal">
                      <div className="flex-1 font-semibold text-[#1A2F1C]">
                        <span className="text-[#2E6F40] font-black mr-2">{item.quantity}x</span>
                        {item.name}
                        {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                          <div className="text-[9.5px] text-[#6B7A68] font-medium mt-0.5 ml-6">
                            {item.selectedCustomizations.map(c => c.optionName).join(', ')}
                          </div>
                        )}
                      </div>
                      <span className="font-extrabold text-[#6B7A68] ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#6B7A68] font-semibold">Total Amount</span>
                  <span className="font-black text-sm text-[#2E6F40]">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            );
          })}

          {/* Cumulative Session Summary */}
          {tableOrders.some(o => o.status !== 'cancelled') && (
            <div className="bg-[#FAF9F5] border border-[#E0E6DF] rounded-3xl p-5 mt-6 text-center space-y-3 shadow-inner">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-[#6B7A68]">Table Session Summary</span>
              <div className="flex justify-between items-center border-b border-[#E0E6DF] pb-3 text-xs">
                <span className="font-semibold text-[#6B7A68]">Total Ordered Items</span>
                <span className="font-extrabold text-[#1A2F1C]">
                  {tableOrders
                    .filter(o => o.status !== 'cancelled')
                    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#6B7A68]">Total Bill Due</span>
                <span className="font-black text-base text-[#1A2F1C]">
                  ${tableOrders
                    .filter(o => o.status !== 'cancelled')
                    .reduce((sum, o) => sum + o.totalAmount, 0)
                    .toFixed(2)}
                </span>
              </div>
              
              <button 
                onClick={() => {
                  setWaiterReason('Request Bill');
                  submitCallWaiter();
                }}
                className="w-full bg-[#1A2F1C] hover:bg-[#0E1B10] text-white py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider shadow transition-all cursor-pointer mt-2"
              >
                Request Bill Checkout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
