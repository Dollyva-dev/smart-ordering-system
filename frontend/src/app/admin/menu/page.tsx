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
      <h1 className="text-3xl font-black text-slate-900 mb-8">Menu Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Item Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Item</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <input required value={category} onChange={e => setCategory(e.target.value)} type="text" placeholder="e.g. Starters, Mains" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input required value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors">
              Add to Menu
            </button>
          </form>
        </div>

        {/* Menu Items List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Current Menu</h2>
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-20 bg-slate-200 rounded-xl"></div>
                <div className="h-20 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} className={`bg-white p-5 rounded-2xl shadow-sm border ${item.isAvailable ? 'border-slate-100' : 'border-red-100 bg-red-50/30'} flex justify-between items-center transition-all`}>
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                    <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">{item.category}</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-2">{item.description}</p>
                  <p className="font-black text-amber-600">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <button 
                    onClick={() => toggleAvailability(item)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${item.isAvailable ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                  >
                    {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="px-4 py-2 rounded-lg text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
