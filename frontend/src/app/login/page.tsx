"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAuth(data.token, data.username);
        router.push('/admin/orders');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
        <h1 className="text-4xl font-black text-amber-500 mb-2">Dollyva</h1>
        <p className="text-slate-500 font-medium mb-8">Sign in to Admin Dashboard</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-amber-500 transition-colors shadow-lg active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-4"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
