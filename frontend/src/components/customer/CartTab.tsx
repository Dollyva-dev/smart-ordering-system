import { Icons } from './Icons';
import { CartItem } from '@/store/cartStore';

interface CartTabProps {
  items: CartItem[];
  cartTotalQty: number;
  orderStatus: 'success' | 'error' | 'submitting' | null;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  getTotal: () => number;
  handlePlaceOrder: () => void;
  setCurrentTab: (tab: 'menu' | 'cart' | 'orders') => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  removeItem: (cartId: string) => void;
}

export function CartTab({
  items,
  cartTotalQty,
  orderStatus,
  orderNotes,
  setOrderNotes,
  getTotal,
  handlePlaceOrder,
  setCurrentTab,
  updateQuantity,
  removeItem,
}: CartTabProps) {
  return (
    <div className="px-5 py-5 flex flex-col min-h-full">
      <h2 className="text-base font-black text-[#1A2F1C] mb-1 flex items-center gap-2">
        <span>My Tray</span>
        <span className="bg-[#2E6F40] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartTotalQty}</span>
      </h2>
      <p className="text-[#6B7A68] text-xs font-semibold mb-6">Review items and place your order below.</p>

      {items.length === 0 ? (
        <div className="flex-1 py-16 flex flex-col items-center justify-center text-center bg-white border border-[#E0E6DF] rounded-3xl p-6 shadow-sm">
          <div className="w-16 h-16 bg-[#E8F5E9] text-[#2E6F40] rounded-full flex items-center justify-center mb-4">
            <Icons.Cart />
          </div>
          <h3 className="font-bold text-sm text-[#1A2F1C] mb-1">Your tray is empty</h3>
          <p className="text-[#6B7A68] text-xs font-semibold max-w-[200px] leading-relaxed mb-6">Go to the menu and add items to place an order.</p>
          <button 
            onClick={() => setCurrentTab('menu')}
            className="bg-[#2E6F40] hover:bg-[#1D4A2A] text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all active:scale-95 shadow-md shadow-[#2E6F40]/15 cursor-pointer"
          >
            View Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cart Success / Error Messages */}
          {orderStatus === 'success' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-2xl font-bold text-center text-xs shadow-sm flex items-center justify-center gap-2 animate-bounce">
              🎉 Order placed! Preparing your meal now...
            </div>
          )}

          {orderStatus === 'error' && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl font-bold text-center text-xs shadow-sm flex items-center justify-center gap-2">
              ⚠️ Failed to send order. Please notify wait staff.
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.cartId} className="bg-white rounded-[24px] border border-[#E0E6DF] p-3 shadow-sm flex gap-3.5 items-stretch relative overflow-hidden">
                
                {/* Item Image */}
                <div className="w-20 h-20 shrink-0 rounded-[18px] bg-[#FAF9F5] overflow-hidden border border-[#E0E6DF]">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#2E6F40]/10 flex items-center justify-center text-[#2E6F40]">
                      <Icons.Menu />
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                  <h3 className="text-[13px] font-black text-[#1A2F1C] leading-tight pr-2">{item.name}</h3>
                  <p className="text-[11px] text-[#2E6F40] font-extrabold mt-1">
                    ${item.price.toFixed(2)}
                  </p>
                  
                  {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.selectedCustomizations.map((c, idx) => (
                        <span key={idx} className="bg-[#FAF9F5] border border-[#E0E6DF] text-[#6B7A68] text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate max-w-full">
                          {c.optionName} {c.price > 0 && `(+$${c.price.toFixed(2)})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Vertical Quantity Controls */}
                <div className="flex flex-col items-center bg-[#F2F8F3] border border-[#C8E6C9] rounded-2xl p-1 justify-between shrink-0">
                  <button 
                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)} 
                    className="w-7 h-7 flex items-center justify-center bg-white text-[#2E6F40] rounded-xl font-black hover:bg-[#E8F5E9] shadow-[0_2px_4px_rgba(0,0,0,0.05)] text-sm cursor-pointer transition-transform active:scale-90"
                  >
                    <Icons.Plus />
                  </button>
                  <span className="font-extrabold text-xs py-1 text-center text-[#2E6F40]">{item.quantity}</span>
                  <button 
                    onClick={() => item.quantity > 1 ? updateQuantity(item.cartId, item.quantity - 1) : removeItem(item.cartId)} 
                    className="w-7 h-7 flex items-center justify-center bg-white text-[#2E6F40] rounded-xl font-black hover:bg-[#E8F5E9] shadow-[0_2px_4px_rgba(0,0,0,0.05)] text-sm cursor-pointer transition-transform active:scale-90"
                  >
                    <Icons.Minus />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Kitchen Special Instructions / Order Notes */}
          <div className="bg-white rounded-3xl border border-[#E0E6DF] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-[#556B2F] font-bold text-xs">
              <Icons.Notes />
              <span>Special Instructions</span>
            </div>
            <textarea 
              placeholder="E.g., No spicy toppings, sauce on the side, extra ice, etc."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full text-xs text-[#1A2F1C] bg-[#FAF9F5] border border-[#E0E6DF] rounded-xl p-3.5 focus:outline-none focus:border-[#2E6F40] placeholder-[#8A9B86] min-h-[70px] resize-none font-medium"
            />
          </div>

          {/* Order Bill Summary */}
          <div className="bg-white rounded-3xl border border-[#E0E6DF] p-5 shadow-sm space-y-2.5">
            <div className="flex justify-between text-xs text-[#6B7A68] font-semibold">
              <span>Subtotal</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#6B7A68] font-semibold">
              <span>Tax (10%)</span>
              <span>${(getTotal() * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#6B7A68] font-semibold">
              <span>Service Charge</span>
              <span className="text-emerald-700 font-bold">FREE</span>
            </div>
            <div className="border-t border-[#E0E6DF] pt-2.5 mt-2 flex justify-between text-[#1A2F1C] font-black">
              <span className="text-xs uppercase tracking-wider">Total Amount</span>
              <span className="text-base text-[#2E6F40]">${(getTotal() * 1.1).toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            onClick={handlePlaceOrder}
            disabled={orderStatus === 'submitting' || items.length === 0}
            className="w-full bg-[#2E6F40] hover:bg-[#1D4A2A] disabled:bg-zinc-350 text-white py-3.5 rounded-2xl font-extrabold text-xs.5 tracking-wider uppercase transition-all duration-200 shadow-md shadow-[#2E6F40]/25 active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {orderStatus === 'submitting' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Placing Order...
              </>
            ) : (
              `Place Order — $${(getTotal() * 1.1).toFixed(2)}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
