"use client";

import { useEffect, useState } from 'react';
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  Trash2, 
  CheckCircle2, 
  Ban, 
  Search, 
  ChevronDown,
  Layers,
  Edit2
} from 'lucide-react';

interface CustomizationOption {
  name: string;
  price: number;
}

interface CustomizationGroup {
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: CustomizationOption[];
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  customizationGroups?: CustomizationGroup[];
  isFeatured?: boolean;
  featuredPosition?: number;
  featuredBadge?: string;
  discountPercent?: number;
  dietaryPreferences?: string[];
}

interface FormOption {
  name: string;
  price: string;
}

interface FormCustomizationGroup {
  name: string;
  required: boolean;
  maxSelect: number;
  options: FormOption[];
}

const RESTAURANT_CATEGORIES = [
  "Appetizers", "Bakery & Breads", "Beverages", "Breakfast", "Brunch", "Burgers", 
  "Cocktails", "Coffee & Tea", "Curries", "Desserts", "Dim Sum & Dumplings", 
  "Entrées", "Gluten-Free Options", "Hot Drinks", "Ice Cream & Shakes", "Juices & Smoothies", 
  "Kids Menu", "Mains", "Noodles & Ramen", "Pasta", "Pastries & Cakes", "Pizzas", 
  "Platters & Combos", "Rice Bowls", "Salads", "Sandwiches", "Sauces & Dips", 
  "Seafood", "Sides", "Snacks", "Soft Drinks", "Starters", "Steaks & Grills", 
  "Sushi & Sashimi", "Tacos & Burritos", "Tapas", "Vegan Options", "Vegetarian Options", 
  "Wine & Beer", "Wraps"
];

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const openDrawer = (item?: MenuItem) => {
    if (item) {
      setEditingItemId(item._id);
      setName(item.name);
      setDescription(item.description);
      setPrice(item.price.toString());
      setCategory(item.category);
      setImageUrl(item.imageUrl || '');
      setImagePreviewUrl(item.imageUrl || '');
      setCustomizationGroups(item.customizationGroups?.map(g => ({
        name: g.name,
        required: g.required,
        maxSelect: g.maxSelect,
        options: g.options.map(o => ({ name: o.name, price: o.price.toString() }))
      })) || []);
      setDietaryPreferences(item.dietaryPreferences || []);
    } else {
      setEditingItemId(null);
      resetFormState();
    }
    setIsDrawerMounted(true);
    setTimeout(() => setIsDrawerVisible(true), 10);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerMounted(false);
      resetFormState();
      setEditingItemId(null);
    }, 300);
  };

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  
  // Dietary State
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  
  // Promo Drawer State
  const [isPromoDrawerVisible, setIsPromoDrawerVisible] = useState(false);
  const [promoItemsState, setPromoItemsState] = useState<Record<string, {
    isFeatured: boolean;
    featuredPosition: number;
    featuredBadge: string;
    discountPercent: number;
  }>>({});
  const [savingPromos, setSavingPromos] = useState(false);
  
  // Dropdown Category State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Customization groups state
  const [customizationGroups, setCustomizationGroups] = useState<FormCustomizationGroup[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isDrawerVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerVisible]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setImageUrl(''); 
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return imageUrl || imagePreviewUrl;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const res = await fetch('http://localhost:5000/api/menu/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.imageUrl || '';
      }
      return '';
    } catch (err) {
      console.error('Error uploading image:', err);
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleAddGroup = () => {
    setCustomizationGroups(prev => [
      ...prev,
      { name: '', required: false, maxSelect: 1, options: [{ name: '', price: '0' }] }
    ]);
  };

  const handleRemoveGroup = (gIdx: number) => {
    setCustomizationGroups(prev => prev.filter((_, idx) => idx !== gIdx));
  };

  const handleGroupChange = (gIdx: number, fields: Partial<FormCustomizationGroup>) => {
    setCustomizationGroups(prev =>
      prev.map((g, idx) => (idx === gIdx ? { ...g, ...fields } : g))
    );
  };

  const handleAddOption = (gIdx: number) => {
    setCustomizationGroups(prev =>
      prev.map((g, idx) =>
        idx === gIdx ? { ...g, options: [...g.options, { name: '', price: '0' }] } : g
      )
    );
  };

  const handleRemoveOption = (gIdx: number, oIdx: number) => {
    setCustomizationGroups(prev =>
      prev.map((g, idx) =>
        idx === gIdx ? { ...g, options: g.options.filter((_, oIndex) => oIndex !== oIdx) } : g
      )
    );
  };

  const handleOptionChange = (gIdx: number, oIdx: number, fields: Partial<FormOption>) => {
    setCustomizationGroups(prev =>
      prev.map((g, idx) =>
        idx === gIdx
          ? {
              ...g,
              options: g.options.map((o, oIndex) => (oIndex === oIdx ? { ...o, ...fields } : o))
            }
          : g
      )
    );
  };

  const resetFormState = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageFile(null);
    setImagePreviewUrl('');
    setImageUrl('');
    setCustomizationGroups([]);
    setDropdownOpen(false);
    setDietaryPreferences([]);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalImageUrl = await uploadImage();

      const formattedGroups = customizationGroups.map(g => ({
        name: g.name,
        required: g.required,
        minSelect: g.required ? 1 : 0,
        maxSelect: g.maxSelect,
        options: g.options.map(o => ({
          name: o.name,
          price: parseFloat(o.price) || 0
        }))
      }));

      const url = editingItemId 
        ? `http://localhost:5000/api/menu/${editingItemId}`
        : 'http://localhost:5000/api/menu';
        
      const method = editingItemId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category,
          imageUrl: finalImageUrl,
          customizationGroups: formattedGroups,
          dietaryPreferences
        })
      });
      if (res.ok) {
        closeDrawer();
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

  const openPromoDrawer = () => {
    const initialState: Record<string, any> = {};
    items.forEach(item => {
      initialState[item._id] = {
        isFeatured: item.isFeatured || false,
        featuredPosition: item.featuredPosition || 1,
        featuredBadge: item.featuredBadge || 'Sale',
        discountPercent: item.discountPercent || 0
      };
    });
    setPromoItemsState(initialState);
    setIsPromoDrawerVisible(true);
  };

  const handleSavePromos = async () => {
    setSavingPromos(true);
    try {
      const promises = items.map(item => {
        const promoState = promoItemsState[item._id];
        if (!promoState) return Promise.resolve();
        // Only patch if something changed (simplification: we just patch all for now)
        return fetch(`http://localhost:5000/api/menu/${item._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isFeatured: promoState.isFeatured,
            featuredPosition: promoState.isFeatured ? promoState.featuredPosition : null,
            featuredBadge: promoState.isFeatured ? promoState.featuredBadge : null,
            discountPercent: promoState.discountPercent || 0
          })
        });
      });
      await Promise.all(promises);
      setIsPromoDrawerVisible(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPromos(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto relative">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Menu Items</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your restaurant catalog and offerings</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={openPromoDrawer}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            Promotions
          </button>
          <button 
            onClick={() => openDrawer()}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} /> Add New Item
          </button>
        </div>
      </div>

      {/* Grid of Product Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-zinc-100 rounded-xl h-72 animate-pulse border border-zinc-200/50"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-50/50 border border-dashed border-zinc-200 rounded-xl">
          <Layers size={48} strokeWidth={1} className="text-zinc-300 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-1">No items found</h3>
          <p className="text-sm text-zinc-500 mb-6">Your menu is currently empty. Get started by adding a dish.</p>
          <button 
            onClick={() => openDrawer()}
            className="flex items-center gap-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} /> Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
          {items.map(item => (
            <div 
              key={item._id} 
              className={`flex flex-col bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 ${!item.isAvailable ? 'border-zinc-200 opacity-75 grayscale-[30%]' : 'border-zinc-200'}`}
            >
              {/* Card Image */}
              <div className="h-44 w-full bg-zinc-100 relative border-b border-zinc-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300">
                    <ImageIcon size={32} strokeWidth={1.5} />
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                    Sold Out
                  </div>
                )}
                {item.customizationGroups && item.customizationGroups.length > 0 && (
                   <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md">
                     {item.customizationGroups.length} Mods
                   </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">{item.category}</span>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-zinc-900 leading-tight">{item.name}</h3>
                  <span className="font-bold text-zinc-900">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>

              {/* Card Footer / Actions */}
              <div className="p-3 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between gap-2">
                <button 
                  onClick={() => toggleAvailability(item)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-colors border ${
                    item.isAvailable 
                      ? 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {item.isAvailable ? <><Ban size={14} /> Disable</> : <><CheckCircle2 size={14} /> Enable</>}
                </button>
                <button 
                  onClick={() => openDrawer(item)}
                  className="p-1.5 rounded-md text-zinc-400 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100"
                  title="Edit Item"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                  title="Delete Item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-out Drawer Overlay */}
      {isDrawerMounted && (
        <div 
          className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300 ${isDrawerVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => !uploading && closeDrawer()}
        >
          {/* Drawer Panel */}
          <div 
            className={`w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-zinc-200 ${isDrawerVisible ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">{editingItemId ? 'Edit Item' : 'Add New Item'}</h2>
              <button 
                onClick={() => !uploading && closeDrawer()}
                className="text-zinc-400 hover:text-zinc-800 transition-colors p-1 rounded-md hover:bg-zinc-100"
                disabled={uploading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body (Form) */}
            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
              <form id="add-item-form" onSubmit={handleAddItem} className="space-y-5">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Item Name</label>
                    <input 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      type="text" 
                      placeholder="e.g., Truffle Fries"
                      className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-400" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Price ($)</label>
                      <input 
                        required 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all" 
                      />
                    </div>
                    
                    {/* Category Dropdown */}
                    <div className="relative">
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Category</label>
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="w-full bg-white text-left text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all flex justify-between items-center"
                      >
                        <span className="truncate pr-2">{category || "Select..."}</span>
                        <ChevronDown size={14} className="text-zinc-400 flex-shrink-0" />
                      </button>
                      
                      {dropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl z-50 max-h-60 flex flex-col overflow-hidden">
                          <div className="p-2 border-b border-zinc-100 flex flex-items-center gap-2 bg-zinc-50/50">
                            <Search size={14} className="text-zinc-400 ml-1" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={e => setSearchQuery(e.target.value)}
                              className="w-full bg-transparent text-zinc-900 text-xs outline-none"
                            />
                          </div>
                          <div className="overflow-y-auto flex-1 p-1">
                            {RESTAURANT_CATEGORIES.filter(cat => 
                              cat.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => { setCategory(cat); setDropdownOpen(false); setSearchQuery(''); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-xs hover:bg-zinc-100 transition-colors ${
                                  category === cat ? "bg-zinc-100 font-semibold text-zinc-900" : "text-zinc-600"
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                            {searchQuery && !RESTAURANT_CATEGORIES.some(cat => cat.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => { setCategory(searchQuery.trim()); setDropdownOpen(false); setSearchQuery(''); }}
                                className="w-full text-left px-3 py-2 rounded-md text-xs text-primary font-medium bg-primary/5 hover:bg-primary/10"
                              >
                                Add "{searchQuery.trim()}"
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Description</label>
                    <textarea 
                      required 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      rows={3} 
                      placeholder="Briefly describe the dish..."
                      className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-400 resize-none"
                    />
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">Item Image</label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      {imagePreviewUrl ? (
                        <div className="relative inline-block flex-shrink-0">
                          <img src={imagePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-zinc-200" />
                          <button 
                            type="button" 
                            onClick={() => { setImageFile(null); setImagePreviewUrl(''); }}
                            className="absolute -top-2 -right-2 bg-white border border-zinc-200 hover:bg-red-50 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-sm transition-colors"
                          >
                            <X size={12} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-16 h-16 border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 transition-colors flex-shrink-0 text-zinc-400">
                          <ImageIcon size={20} />
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                      
                      <div className="flex-1">
                        <p className="text-[10px] text-zinc-500 mb-1">Or paste an image URL directly:</p>
                        <input 
                          type="text" 
                          placeholder="https://..." 
                          value={imageUrl} 
                          onChange={e => { setImageUrl(e.target.value); setImageFile(null); setImagePreviewUrl(''); }}
                          className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-xs focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-400" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Dietary Preferences Section */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">Dietary Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {["Vegetarian", "Vegan", "Gluten-Free", "Pescatarian"].map(diet => (
                      <label key={diet} className="flex items-center gap-2 text-xs font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-md cursor-pointer hover:bg-zinc-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={dietaryPreferences.includes(diet)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDietaryPreferences([...dietaryPreferences, diet]);
                            } else {
                              setDietaryPreferences(dietaryPreferences.filter(d => d !== diet));
                            }
                          }}
                          className="accent-zinc-900 w-3.5 h-3.5 rounded-sm"
                        />
                        {diet}
                      </label>
                    ))}
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Customizations */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-semibold text-zinc-700">Customizations</label>
                    <button 
                      type="button" 
                      onClick={handleAddGroup}
                      className="text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} /> Group
                    </button>
                  </div>

                  <div className="space-y-4">
                    {customizationGroups.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-4 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                        No customizations added.
                      </p>
                    )}
                    
                    {customizationGroups.map((group, gIdx) => (
                      <div key={gIdx} className="bg-white border border-zinc-200 rounded-lg p-3 shadow-sm relative group/group">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveGroup(gIdx)}
                          className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 transition-colors bg-white"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="pr-6 mb-3">
                          <input 
                            type="text" 
                            required 
                            placeholder="Group Name (e.g. Size, Toppings)"
                            value={group.name}
                            onChange={e => handleGroupChange(gIdx, { name: e.target.value })}
                            className="w-full bg-transparent text-zinc-900 font-semibold border-b border-dashed border-zinc-300 pb-1 text-sm focus:border-zinc-900 outline-none placeholder:font-normal placeholder:text-zinc-400"
                          />
                        </div>

                        <div className="flex items-center gap-4 mb-3 bg-zinc-50 p-2 rounded-md border border-zinc-100">
                          <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={group.required}
                              onChange={e => handleGroupChange(gIdx, { required: e.target.checked })}
                              className="accent-zinc-900 w-3.5 h-3.5 rounded-sm"
                            />
                            Required
                          </label>
                          <div className="w-px h-4 bg-zinc-200"></div>
                          <div className="flex items-center gap-2 text-xs font-medium text-zinc-700">
                            Max Select:
                            <input 
                              type="number" 
                              min={1} 
                              value={group.maxSelect}
                              onChange={e => handleGroupChange(gIdx, { maxSelect: parseInt(e.target.value) || 1 })}
                              className="w-12 bg-white border border-zinc-200 rounded text-center py-0.5"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 pl-2 border-l-2 border-zinc-100">
                          {group.options.map((option, oIdx) => (
                            <div key={oIdx} className="flex gap-2 items-center">
                              <input 
                                type="text" 
                                required 
                                placeholder="Option" 
                                value={option.name}
                                onChange={e => handleOptionChange(gIdx, oIdx, { name: e.target.value })}
                                className="flex-1 bg-white text-zinc-900 border border-zinc-200 rounded-md px-2 py-1.5 text-xs focus:border-zinc-900 outline-none"
                              />
                              <div className="relative w-20">
                                <span className="absolute left-2 top-1.5 text-xs text-zinc-400">$</span>
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00" 
                                  value={option.price}
                                  onChange={e => handleOptionChange(gIdx, oIdx, { price: e.target.value })}
                                  className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md pl-5 pr-2 py-1.5 text-xs focus:border-zinc-900 outline-none"
                                />
                              </div>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveOption(gIdx, oIdx)}
                                disabled={group.options.length <= 1}
                                className="text-zinc-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button" 
                            onClick={() => handleAddOption(gIdx)}
                            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 mt-1"
                          >
                            <Plus size={10} /> Add Option
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Drawer Footer (Sticky Actions) */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex gap-3 mt-auto">
              <button 
                type="button"
                onClick={() => !uploading && closeDrawer()}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="add-item-form"
                disabled={uploading}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 shadow-sm transition-colors disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Save Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Drawer */}
      {isPromoDrawerVisible && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsPromoDrawerVisible(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform border-l border-zinc-200">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-100 bg-amber-50/30">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <span className="text-amber-500">★</span> Promotions & Sliders
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Manage discounts and featured items across your entire menu</p>
              </div>
              <button 
                onClick={() => setIsPromoDrawerVisible(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 custom-scrollbar space-y-4">
              {items.map(item => {
                const promo = promoItemsState[item._id];
                if (!promo) return null;
                return (
                  <div key={item._id} className="bg-white border border-zinc-200 rounded-xl p-4 flex gap-4 items-start shadow-sm hover:border-amber-200 transition-colors">
                    <img src={item.imageUrl || ''} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-100" />
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-zinc-900 text-sm">{item.name}</h3>
                          <p className="text-xs text-zinc-500">${item.price.toFixed(2)}</p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs font-semibold text-zinc-700">In Slider</span>
                          <div className="relative inline-flex items-center">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={promo.isFeatured}
                              onChange={(e) => setPromoItemsState(prev => ({
                                ...prev, 
                                [item._id]: { ...prev[item._id], isFeatured: e.target.checked }
                              }))}
                            />
                            <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
                          </div>
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Discount %</label>
                          <input 
                            type="number"
                            min="0"
                            max="100"
                            value={promo.discountPercent || ''}
                            onChange={(e) => setPromoItemsState(prev => ({
                              ...prev, 
                              [item._id]: { ...prev[item._id], discountPercent: parseInt(e.target.value) || 0 }
                            }))}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                            placeholder="0"
                          />
                        </div>
                        {promo.isFeatured && (
                          <>
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Position</label>
                              <select 
                                value={promo.featuredPosition}
                                onChange={(e) => setPromoItemsState(prev => ({
                                  ...prev, 
                                  [item._id]: { ...prev[item._id], featuredPosition: parseInt(e.target.value) }
                                }))}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                              >
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Badge</label>
                              <select 
                                value={promo.featuredBadge}
                                onChange={(e) => setPromoItemsState(prev => ({
                                  ...prev, 
                                  [item._id]: { ...prev[item._id], featuredBadge: e.target.value }
                                }))}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                              >
                                <option value="Sale">Sale</option>
                                <option value="Combo">Combo</option>
                                <option value="Free Item">Free Item</option>
                                <option value="Chef's Special">Chef's Special</option>
                                <option value="Popular">Popular</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-zinc-100 bg-white flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsPromoDrawerVisible(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSavePromos}
                disabled={savingPromos}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {savingPromos ? 'Saving...' : 'Save Promotions'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Adding a global class for the drawer scrollbar to keep it minimal */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}} />
    </div>
  );
}