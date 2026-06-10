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

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-pulse text-2xl font-bold text-amber-500">Loading Menu...</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-slate-800">Table {tableId}</h1>
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
            {items.reduce((acc, i) => acc + i.quantity, 0)} items in cart
          </div>
        </div>
      </header>

      {/* Menu Sections */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {orderStatus === 'success' && (
          <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-xl font-semibold text-center shadow-sm">
            🎉 Order placed successfully! The kitchen is preparing it.
          </div>
        )}
        
        {categories.map(category => (
          <div key={category} className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-slate-200 uppercase tracking-wide">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.filter(item => item.category === category).map(item => (
                <div key={item._id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-amber-600 transition-colors">{item.name}</h3>
                      <span className="font-bold text-amber-600">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                  </div>
                  <button 
                    onClick={() => addItem(item)}
                    disabled={!item.isAvailable}
                    className={`w-full py-2.5 rounded-xl font-semibold transition-all ${item.isAvailable ? 'bg-slate-900 text-white hover:bg-amber-500 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item._id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-500">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                    <button onClick={() => item.quantity > 1 ? updateQuantity(item._id, item.quantity - 1) : removeItem(item._id)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-red-500 transition-colors">-</button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-green-500 transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Amount</p>
                <p className="text-2xl font-black text-slate-900">${getTotal().toFixed(2)}</p>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={orderStatus === 'submitting'}
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
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
