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
      <div className="mb-6 pb-4 border-b border-zinc-100">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Table Management</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Manage tables and download dynamically generated QR codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Table Form */}
        <div className="bg-white p-5 rounded-md border border-zinc-200 h-fit sticky top-6">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Add New Table</h2>
          <form onSubmit={handleAddTable} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs font-semibold">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Table Identifier</label>
              <input 
                required 
                value={tableNumber} 
                onChange={e => setTableNumber(e.target.value)} 
                type="text" 
                placeholder="e.g. 10 or Patio-1"
                className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-400" 
              />
            </div>
            <button type="submit" className="w-full bg-zinc-900 text-white text-xs font-semibold py-2.5 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer mt-2">
              Create Table & QR Code
            </button>
          </form>
        </div>

        {/* Tables Grid */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Active Tables</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-zinc-100 border border-zinc-200 rounded-md"></div>
              <div className="h-20 bg-zinc-100 border border-zinc-200 rounded-md"></div>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center bg-zinc-50 py-16 rounded-md border border-dashed border-zinc-250">
              <p className="text-zinc-400 text-sm">No tables added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map(table => (
                <div key={table._id} className="bg-white p-5 rounded-md border border-zinc-200 flex flex-col items-center text-center hover:border-zinc-300 transition-all">
                  <h3 className="font-bold text-base text-zinc-900 mb-2">Table {table.tableNumber}</h3>
                  <div className="bg-white p-2 rounded-md border border-zinc-150 mb-3 inline-block">
                    <QRCodeSVG 
                      value={table.qrCodeUrl} 
                      size={140}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <a 
                    href={table.qrCodeUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-zinc-400 font-mono text-[10px] hover:text-zinc-950 hover:underline mb-4 break-all max-w-full"
                  >
                    {table.qrCodeUrl}
                  </a>
                  <button 
                    onClick={() => handleDeleteTable(table._id)}
                    className="w-full px-3 py-1.5 rounded-md text-xs font-semibold border border-red-100 text-red-655 hover:bg-red-50 transition-colors mt-auto cursor-pointer"
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

