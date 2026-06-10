"use client";

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Table {
  _id: string;
  tableNumber: string;
  qrCodeUrl: string;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tables');
      const data = await res.json();
      setTables(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!tableNumber) return;

    try {
      const res = await fetch('http://localhost:5000/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to add table');
        return;
      }
      
      setTableNumber('');
      fetchTables();
    } catch (err) {
      console.error(err);
      setError('An error occurred while adding the table');
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await fetch(`http://localhost:5000/api/tables/${id}`, { method: 'DELETE' });
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 mb-8">Table Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Table Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit sticky top-10">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Table</h2>
          <form onSubmit={handleAddTable} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Table Identifier (Number/Name)</label>
              <input 
                required 
                value={tableNumber} 
                onChange={e => setTableNumber(e.target.value)} 
                type="text" 
                placeholder="e.g. 10 or Patio-1"
                className="w-full bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" 
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-amber-500 transition-colors">
              Create Table & QR Code
            </button>
          </form>
        </div>

        {/* Tables Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Active Tables</h2>
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-20 bg-slate-200 rounded-xl"></div>
                <div className="h-20 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center bg-white p-8 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500">No tables added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map(table => (
                <div key={table._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                  <h3 className="font-black text-2xl text-slate-900 mb-2">Table {table.tableNumber}</h3>
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 mb-4 inline-block">
                    <QRCodeSVG 
                      value={table.qrCodeUrl} 
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <a 
                    href={table.qrCodeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-amber-600 font-medium text-sm hover:underline mb-4 break-all max-w-full"
                  >
                    {table.qrCodeUrl}
                  </a>
                  <button 
                    onClick={() => handleDeleteTable(table._id)}
                    className="w-full px-4 py-2 rounded-lg text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors mt-auto"
                  >
                    Delete Table
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
