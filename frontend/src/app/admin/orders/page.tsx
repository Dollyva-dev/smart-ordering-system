"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SelectedCustomizationOption {
  groupName: string;
  optionName: string;
  price: number;
}

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  selectedCustomizations?: SelectedCustomizationOption[];
}

interface Order {
  _id: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Initial fetch
    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));

    // Socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('new-order', (order: Order) => {
      setOrders(prev => [order, ...prev]);
    });

    newSocket.on('order-updated', (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'border-red-100 text-red-700 bg-red-50/50';
      case 'preparing': return 'border-zinc-200 text-zinc-800 bg-zinc-100/60';
      case 'served': return 'border-zinc-200 text-zinc-400 bg-zinc-50/40';
      default: return 'border-zinc-200 text-zinc-500 bg-zinc-50';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Live Orders</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Real-time incoming tables feed</p>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 border border-zinc-200 rounded-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-md border border-zinc-200 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-base font-bold text-zinc-900">Table {order.tableNumber}</h2>
                  <p className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 border-b border-zinc-100 pb-1">Items</h3>
                <ul className="divide-y divide-zinc-100">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="py-1.5 flex flex-col gap-0.5">
                      <div className="flex justify-between text-xs text-zinc-800">
                        <span>
                          <span className="text-zinc-400 font-semibold mr-1.5">{item.quantity}x</span>
                          {item.name}
                        </span>
                      </div>
                      {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                        <div className="text-[10px] text-zinc-400 pl-5 leading-normal">
                          {item.selectedCustomizations.map(c => `${c.optionName} (+$${c.price})`).join(', ')}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 mt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-zinc-400 font-medium">Total Amount</span>
                <span className="text-sm font-bold text-zinc-900">${order.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'preparing')}
                    className="col-span-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Accept & Prepare
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'served')}
                    className="col-span-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Mark as Served
                  </button>
                )}
                {order.status === 'served' && (
                  <button disabled className="col-span-2 bg-zinc-50 text-zinc-400 border border-zinc-200 text-xs font-medium py-2 rounded-md">
                    Served & Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-16 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-md">
            <p className="text-zinc-400 text-sm">No orders yet. Waiting for customer activity...</p>
          </div>
        )}
      </div>
    </div>
  );
}

