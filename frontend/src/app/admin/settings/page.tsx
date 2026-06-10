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
    <div className="max-w-xl mx-auto">
      <div className="mb-6 pb-4 border-b border-zinc-100">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Admin Settings</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Modify administrator credentials and settings</p>
      </div>

      <div className="bg-white p-6 rounded-md border border-zinc-200">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-5">Update Credentials</h2>
        
        {status && (
          <div className={`px-3 py-2 rounded-md mb-5 text-xs font-semibold border ${
            status.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-green-50 border-green-200 text-green-705'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-550 mb-1.5">Username</label>
            <input 
              type="text" 
              required
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
            />
          </div>
          
          <div className="pt-3 border-t border-zinc-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-550 mb-1.5">New Password (Optional)</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-550 mb-1.5">Current Password (Required to save)</label>
            <input 
              type="password" 
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
              placeholder="Enter current password to confirm changes"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-zinc-900 text-white text-xs font-semibold py-2.5 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

