"use client";

import { useEffect, useState } from 'react';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/menu');
      const data = await res.json();
      setItems(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category
        })
      });
      if (res.ok) {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`http://localhost:5000/api/menu/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await fetch(`http://localhost:5000/api/menu/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-zinc-100">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Menu Management</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Add, edit, or remove dishes from the digital menu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Item Form */}
        <div className="bg-white p-5 rounded-md border border-zinc-200 h-fit sticky top-6">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Add New Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Name</label>
              <input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                type="text" 
                className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Category</label>
              <input 
                required 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                type="text" 
                placeholder="e.g. Starters, Mains" 
                className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-400" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Price ($)</label>
              <input 
                required 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                type="number" 
                step="0.01" 
                className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Description</label>
              <textarea 
                required 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={3} 
                className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
              ></textarea>
            </div>
            <button type="submit" className="w-full bg-zinc-900 text-white text-xs font-semibold py-2.5 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer mt-2">
              Add to Menu
            </button>
          </form>
        </div>

        {/* Menu Items List */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Current Menu</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-zinc-100 border border-zinc-200 rounded-md"></div>
              <div className="h-20 bg-zinc-100 border border-zinc-200 rounded-md"></div>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} className={`bg-white p-4 rounded-md border ${item.isAvailable ? 'border-zinc-200' : 'border-zinc-200 bg-zinc-50/50 opacity-60'} flex justify-between items-center transition-all hover:border-zinc-300`}>
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-zinc-900">{item.name}</h3>
                    <span className="border border-zinc-200 text-zinc-500 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wider">{item.category}</span>
                  </div>
                  <p className="text-zinc-500 text-xs mb-2 leading-relaxed">{item.description}</p>
                  <p className="font-bold text-sm text-zinc-900">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <button 
                    onClick={() => toggleAvailability(item)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-center ${
                      item.isAvailable 
                        ? 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50' 
                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                    }`}
                  >
                    {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold border border-red-100 text-red-650 hover:bg-red-50 transition-colors cursor-pointer text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

