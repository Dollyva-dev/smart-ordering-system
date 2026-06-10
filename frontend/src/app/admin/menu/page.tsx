"use client";

import { useEffect, useState } from 'react';

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

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  
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
      setImageUrl(''); // Clear manual URL if file selected
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return imageUrl;
    
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
      console.error('Upload failed');
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Upload image first if present
      const finalImageUrl = await uploadImage();

      // 2. Format option groups
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

      // 3. Post to api
      const res = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          category,
          imageUrl: finalImageUrl,
          customizationGroups: formattedGroups
        })
      });
      if (res.ok) {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('');
        setImageFile(null);
        setImagePreviewUrl('');
        setImageUrl('');
        setCustomizationGroups([]);
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
        <div className="bg-white p-5 rounded-md border border-zinc-200 h-fit lg:col-span-1">
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
            <div className="relative">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Category</label>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-white text-left text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all flex justify-between items-center cursor-pointer"
              >
                <span>{category || "Select a category"}</span>
                <span className="text-zinc-400 text-xs">▼</span>
              </button>
              
              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-zinc-205 rounded-md shadow-lg z-30 max-h-60 flex flex-col">
                  <div className="p-2 border-b border-zinc-100 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-50 text-zinc-900 border border-zinc-150 rounded-md px-2.5 py-1 text-xs focus:border-zinc-900 outline-none"
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 py-1">
                    {RESTAURANT_CATEGORIES.filter(cat => 
                      cat.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setCategory(cat);
                          setDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full text-left px-3.5 py-1.5 text-xs hover:bg-zinc-50 transition-colors cursor-pointer ${
                          category === cat ? "bg-zinc-50 font-semibold text-zinc-950" : "text-zinc-650"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                    {searchQuery && !RESTAURANT_CATEGORIES.some(cat => cat.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategory(searchQuery.trim());
                          setDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-900 hover:bg-zinc-50 font-medium border-t border-zinc-100 cursor-pointer"
                      >
                        Add custom: "{searchQuery.trim()}"
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                rows={2} 
                className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1.5 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
              ></textarea>
            </div>

            {/* Image Upload Block */}
            <div className="border-t border-zinc-100 pt-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">Food Image</label>
              <div className="space-y-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="w-full text-xs text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border file:border-zinc-200 file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100 cursor-pointer"
                />
                <div className="text-[10px] text-zinc-400 text-center uppercase tracking-wider">or paste image URL</div>
                <input 
                  type="text" 
                  placeholder="http://example.com/food.jpg" 
                  value={imageUrl} 
                  onChange={e => {
                    setImageUrl(e.target.value);
                    setImageFile(null);
                    setImagePreviewUrl('');
                  }}
                  className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-3 py-1 text-xs focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-400" 
                />
                {imagePreviewUrl && (
                  <div className="mt-2 relative inline-block">
                    <img src={imagePreviewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-zinc-200" />
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreviewUrl(''); }}
                      className="absolute -top-1 -right-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Customizations Block */}
            <div className="border-t border-zinc-100 pt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-550">Customizations</label>
                <button 
                  type="button" 
                  onClick={handleAddGroup}
                  className="text-[10px] font-bold text-zinc-900 hover:underline cursor-pointer uppercase tracking-wider"
                >
                  + Add Group
                </button>
              </div>

              <div className="space-y-4">
                {customizationGroups.map((group, gIdx) => (
                  <div key={gIdx} className="bg-zinc-50 border border-zinc-200 rounded-md p-3 relative space-y-3">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveGroup(gIdx)}
                      className="absolute top-2 right-2 text-zinc-400 hover:text-red-650 text-xs font-bold"
                    >
                      ✕
                    </button>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Group Name</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Choose Size, Add Toppings"
                        value={group.name}
                        onChange={e => handleGroupChange(gIdx, { name: e.target.value })}
                        className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-md px-2.5 py-1 text-xs focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-zinc-650 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={group.required}
                          onChange={e => handleGroupChange(gIdx, { required: e.target.checked })}
                          className="accent-zinc-900 border-zinc-300 w-3 h-3"
                        />
                        <span>Required Selection?</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-400 uppercase">Max Picks:</span>
                        <input 
                          type="number" 
                          min={1} 
                          value={group.maxSelect}
                          onChange={e => handleGroupChange(gIdx, { maxSelect: parseInt(e.target.value) || 1 })}
                          className="w-10 bg-white border border-zinc-200 rounded-md px-1.5 py-0.5 text-xs text-center"
                        />
                      </div>
                    </div>

                    <div className="border-t border-zinc-200/60 pt-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-zinc-450 uppercase font-semibold">
                        <span>Options</span>
                        <button 
                          type="button" 
                          onClick={() => handleAddOption(gIdx)}
                          className="text-[9px] font-bold text-zinc-900 hover:underline cursor-pointer"
                        >
                          + Add Option
                        </button>
                      </div>

                      {group.options.map((option, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-center">
                          <input 
                            type="text" 
                            required 
                            placeholder="Option Name" 
                            value={option.name}
                            onChange={e => handleOptionChange(gIdx, oIdx, { name: e.target.value })}
                            className="flex-1 bg-white text-zinc-900 border border-zinc-200 rounded-md px-2 py-0.5 text-xs"
                          />
                          <input 
                            type="number" 
                            step="0.01" 
                            placeholder="Price" 
                            value={option.price}
                            onChange={e => handleOptionChange(gIdx, oIdx, { price: e.target.value })}
                            className="w-14 bg-white text-zinc-900 border border-zinc-200 rounded-md px-1 py-0.5 text-xs text-center"
                          />
                          {group.options.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemoveOption(gIdx, oIdx)}
                              className="text-zinc-400 hover:text-red-500 text-[10px]"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className="w-full bg-zinc-900 text-white text-xs font-semibold py-2.5 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer mt-2 disabled:opacity-50"
            >
              {uploading ? 'Uploading Image...' : 'Add to Menu'}
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
              <div key={item._id} className={`bg-white p-4 rounded-md border ${item.isAvailable ? 'border-zinc-200' : 'border-zinc-200 bg-zinc-50/50 opacity-60'} flex justify-between items-center transition-all hover:border-zinc-300 gap-4`}>
                <div className="flex-1 flex gap-3 items-center min-w-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-zinc-200 flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-zinc-50 border border-dashed border-zinc-200 rounded-md flex items-center justify-center text-[8px] text-zinc-400 flex-shrink-0">No Image</div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-sm text-zinc-900 truncate">{item.name}</h3>
                      <span className="border border-zinc-200 text-zinc-500 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wider">{item.category}</span>
                    </div>
                    <p className="text-zinc-500 text-xs mb-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-sm text-zinc-900">${item.price.toFixed(2)}</p>
                      {item.customizationGroups && item.customizationGroups.length > 0 && (
                        <p className="text-[9px] font-semibold text-zinc-400 font-mono">
                          ({item.customizationGroups.length} opt groups)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[120px] flex-shrink-0">
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
