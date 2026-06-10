"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AdminSettingsPage() {
  const { token, username, setAuth } = useAuthStore();
  
  const [newUsername, setNewUsername] = useState(username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setStatus({ type: 'error', message: 'Current password is required to save changes.' });
      return;
    }
    
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          newUsername, 
          newPassword: newPassword || undefined,
          currentPassword 
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAuth(data.token, data.username);
        setStatus({ type: 'success', message: 'Settings updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to update settings.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Admin Settings</h1>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Update Credentials</h2>
        
        {status && (
          <div className={`p-4 rounded-xl mb-6 font-semibold ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              required
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">New Password (Optional)</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">Current Password (Required to save)</label>
            <input 
              type="password" 
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              placeholder="Enter current password to confirm changes"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-amber-500 transition-colors shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-6"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
