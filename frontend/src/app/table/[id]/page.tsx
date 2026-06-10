"use client";

import { useEffect, useState, use } from 'react';
import { useCartStore } from '@/store/cartStore';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export default function TableMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  
  // Unwrap params
  const { id: tableId } = use(params);

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching menu:', err);
        setLoading(false);
      });
  }, []);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setOrderStatus('submitting');
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableId,
          items: items.map(i => ({
            menuItem: i._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity
          })),
          totalAmount: getTotal()
        })
      });
      
      if (res.ok) {
        clearCart();
        setOrderStatus('success');
        setTimeout(() => setOrderStatus(null), 5000);
      } else {
        setOrderStatus('error');
      }
    } catch (err) {
      console.error(err);
      setOrderStatus('error');
    }
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Menu...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <h1 className="text-base font-bold text-zinc-900">Table {tableId}</h1>
          <div className="border border-zinc-200 bg-zinc-50 text-zinc-500 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
            {items.reduce((acc, i) => acc + i.quantity, 0)} items in cart
          </div>
        </div>
      </header>

      {/* Menu Sections */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {orderStatus === 'success' && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md font-semibold text-center text-sm shadow-sm">
            🎉 Order placed successfully! The kitchen is preparing it.
          </div>
        )}

        {orderStatus === 'error' && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md font-semibold text-center text-sm shadow-sm">
            ⚠️ Failed to place order. Please check with staff.
          </div>
        )}
        
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 pb-1.5 border-b border-zinc-205">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.filter(item => item.category === category).map(item => (
                <div key={item._id} className="bg-white rounded-md p-4 border border-zinc-200 hover:border-zinc-350 transition-all flex flex-col justify-between group">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm text-zinc-800 transition-colors">{item.name}</h3>
                      <span className="font-semibold text-sm text-zinc-900">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  <button 
                    onClick={() => addItem(item)}
                    disabled={!item.isAvailable}
                    className={`w-full py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      item.isAvailable 
                        ? 'bg-zinc-900 text-white hover:bg-zinc-850 active:scale-[0.98]' 
                        : 'border border-zinc-200 bg-zinc-55 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {item.isAvailable ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Sticky Bottom Cart Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-3 max-h-48 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item._id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-zinc-800">{item.name}</p>
                    <p className="text-xs text-zinc-400">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md p-0.5">
                    <button 
                      onClick={() => item.quantity > 1 ? updateQuantity(item._id, item.quantity - 1) : removeItem(item._id)} 
                      className="w-6 h-6 flex items-center justify-center bg-white rounded border border-zinc-150 text-zinc-650 hover:bg-zinc-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-semibold text-xs w-5 text-center text-zinc-850">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)} 
                      className="w-6 h-6 flex items-center justify-center bg-white rounded border border-zinc-150 text-zinc-650 hover:bg-zinc-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Amount</p>
                <p className="text-lg font-bold text-zinc-900">${getTotal().toFixed(2)}</p>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={orderStatus === 'submitting'}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                {orderStatus === 'submitting' ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

