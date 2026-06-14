"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Settings, Percent, KeyRound, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { useDialog } from '@/components/admin/DialogProvider';

interface Promotion {
  _id: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'credentials' | 'general' | 'promotions'>('general');

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-6 pb-4 border-b border-zinc-100 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage restaurant details, promotions, and administrator credentials</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-zinc-100/50 p-1 rounded-xl flex-shrink-0 w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'general' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Settings size={16} />
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'promotions' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Percent size={16} />
          Promotions
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'credentials' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <KeyRound size={16} />
          Credentials
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-10">
        {activeTab === 'general' && <GeneralSettingsTab />}
        {activeTab === 'promotions' && <PromotionsTab />}
        {activeTab === 'credentials' && <CredentialsTab />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Credentials Tab
// ----------------------------------------------------------------------
function CredentialsTab() {
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
    <div className="max-w-xl">
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-5">Update Credentials</h2>
        
        {status && (
          <div className={`px-3 py-2 rounded-md mb-5 text-sm font-medium border ${
            status.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Username</label>
            <input 
              type="text" 
              required
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
            />
          </div>
          
          <div className="pt-3 border-t border-zinc-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">New Password (Optional)</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div className="pt-3 border-t border-zinc-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Current Password (Required)</label>
            <input 
              type="password" 
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
              placeholder="Enter current password to confirm changes"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// General Settings Tab
// ----------------------------------------------------------------------
function GeneralSettingsTab() {
  const { token } = useAuthStore();
  
  const [tax, setTax] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  
  const [status, setStatus] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      const data = await res.json();
      if (res.ok && data) {
        setTax(data.taxPercentage || 0);
        setServiceCharge(data.serviceChargePercentage || 0);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          taxPercentage: tax,
          serviceChargePercentage: serviceCharge
        })
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Settings updated successfully!' });
      } else {
        setStatus({ type: 'error', message: 'Failed to update settings.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'An error occurred.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (initialLoading) return <div className="text-sm text-zinc-500">Loading settings...</div>;

  return (
    <div className="max-w-xl">
      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-5">Financial Settings</h2>
        
        {status && (
          <div className={`px-3 py-2 rounded-md mb-5 text-sm font-medium border ${
            status.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Tax Percentage (%)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required
              value={tax}
              onChange={e => setTax(parseFloat(e.target.value) || 0)}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
            />
          </div>
          
          <div className="pt-3 border-t border-zinc-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Service Charge Percentage (%)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              required
              value={serviceCharge}
              onChange={e => setServiceCharge(parseFloat(e.target.value) || 0)}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-zinc-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Promotions Tab
// ----------------------------------------------------------------------
function PromotionsTab() {
  const { token } = useAuthStore();
  const { confirm } = useDialog();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/promotions');
      if (res.ok) {
        const data = await res.json();
        setPromotions(data);
      }
    } catch (err) {
      console.error('Failed to fetch promotions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ message: 'Are you sure you want to delete this promotion?', type: 'warning' }))) return;
    try {
      const res = await fetch(`http://localhost:5000/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (promo: Promotion) => {
    try {
      const res = await fetch(`http://localhost:5000/api/promotions/${promo._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: !promo.isActive })
      });
      if (res.ok) {
        fetchPromotions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Active Promotions</h2>
          <p className="text-sm text-zinc-500">Configure discounts to attract customers</p>
        </div>
        <button 
          onClick={() => { setEditingPromo(null); setIsModalOpen(true); }}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
        >
          <Plus size={16} />
          New Promotion
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-500">Loading promotions...</div>
      ) : promotions.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-xl p-8 text-center">
          <p className="text-zinc-500 text-sm font-medium">No promotions found.</p>
          <p className="text-zinc-400 text-xs mt-1">Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map(promo => (
            <div key={promo._id} className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col transition-all ${!promo.isActive ? 'opacity-60 border-zinc-200' : 'border-zinc-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-zinc-900 text-base">{promo.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${promo.discountType === 'PERCENTAGE' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {promo.discountType}
                </span>
              </div>
              
              {promo.description && <p className="text-xs text-zinc-500 mb-4">{promo.description}</p>}
              
              <div className="mt-auto space-y-1.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Discount:</span>
                  <span className="font-semibold text-zinc-900">
                    {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Min. Order:</span>
                  <span className="font-semibold text-zinc-900">${promo.minOrderValue}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between mt-auto">
                <button 
                  onClick={() => handleToggleActive(promo)}
                  className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${promo.isActive ? 'text-zinc-500 hover:bg-zinc-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                >
                  {promo.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex gap-1">
                  <button 
                    onClick={() => { setEditingPromo(promo); setIsModalOpen(true); }}
                    className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(promo._id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <PromotionModal 
          promo={editingPromo} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchPromotions(); }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Promotion Modal
// ----------------------------------------------------------------------
function PromotionModal({ promo, onClose, onSuccess }: { promo: Promotion | null, onClose: () => void, onSuccess: () => void }) {
  const { token } = useAuthStore();
  const { alert } = useDialog();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: promo?.name || '',
    description: promo?.description || '',
    discountType: promo?.discountType || 'PERCENTAGE',
    discountValue: promo?.discountValue || 0,
    minOrderValue: promo?.minOrderValue || 0,
    isActive: promo ? promo.isActive : true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = promo 
        ? `http://localhost:5000/api/promotions/${promo._id}`
        : `http://localhost:5000/api/promotions`;
        
      const res = await fetch(url, {
        method: promo ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        await alert({ message: 'Failed to save promotion', type: 'error' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-zinc-100">
          <h3 className="font-bold text-zinc-900">{promo ? 'Edit Promotion' : 'Create Promotion'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Promotion Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 outline-none transition-all"
              placeholder="e.g. Summer Special"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Description (Optional)</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 outline-none transition-all resize-none"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Discount Type</label>
              <select 
                value={formData.discountType}
                onChange={e => setFormData({...formData, discountType: e.target.value as 'PERCENTAGE' | 'FLAT'})}
                className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 outline-none transition-all"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount ($)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Discount Value</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                required
                value={formData.discountValue}
                onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 outline-none transition-all"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Minimum Order Value ($)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              value={formData.minOrderValue}
              onChange={e => setFormData({...formData, minOrderValue: parseFloat(e.target.value) || 0})}
              className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 outline-none transition-all"
              placeholder="0 for no minimum"
            />
          </div>

          <label className="flex items-center gap-2 pt-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.isActive}
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
              className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span className="text-sm font-medium text-zinc-700">Promotion is Active</span>
          </label>
          
          <div className="pt-4 flex gap-2 border-t border-zinc-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
