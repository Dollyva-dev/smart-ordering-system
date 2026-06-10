"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'preparing': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'served': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">Live Orders</h1>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-600">Live Connection</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map(order => (
          <div key={order._id} className={`bg-white rounded-2xl shadow-sm border ${getStatusColor(order.status).replace('bg-', 'border-').split(' ')[0]} p-6 flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Table {order.tableNumber}</h2>
                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="flex-1 mb-6">
              <h3 className="font-semibold text-slate-700 mb-2 border-b pb-2">Order Items</h3>
              <ul className="space-y-2">
                {order.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span className="font-medium text-slate-800"><span className="text-amber-600 font-bold mr-2">{item.quantity}x</span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-medium">Total</span>
                <span className="text-xl font-black text-slate-900">${order.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'preparing')}
                    className="col-span-2 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-bold transition-colors"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateStatus(order._id, 'served')}
                    className="col-span-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors"
                  >
                    Mark as Served
                  </button>
                )}
                {order.status === 'served' && (
                  <button disabled className="col-span-2 bg-slate-100 text-slate-400 py-2 rounded-lg font-bold">
                    Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">No orders yet. Waiting for customers...</p>
          </div>
        )}
      </div>
    </div>
  );
}
