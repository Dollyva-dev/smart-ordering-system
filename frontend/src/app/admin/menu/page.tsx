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
  Edit2,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { useDialog } from '@/components/admin/DialogProvider';

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
  prepTime?: number;
  calories?: number;
  spicinessLevel?: number;
  allergens?: string[];
  isAlcoholic?: boolean;
  abv?: number;
  isSeasonal?: boolean;
  seasonalAvailability?: string;
  note?: string;
}

export interface Promotion {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  promoType: 'discount' | 'bogo' | 'combo' | 'spend_more';
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  applicableItemIds: any[];
  requiredItemIds: any[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isFeatured?: boolean;
  featuredPosition?: number;
  featuredBadge?: string;
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
  const { confirm, alert } = useDialog();
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
      setPrepTime(item.prepTime?.toString() || '');
      setCalories(item.calories?.toString() || '');
      setSpicinessLevel(item.spicinessLevel || 1);
      setIsSpicyToggle((item.spicinessLevel || 0) > 0);
      setAllergens(item.allergens || []);
      setIsAlcoholic(item.isAlcoholic || false);
      setAbv(item.abv?.toString() || '');
      setIsSeasonal(item.isSeasonal || false);
      setSeasonalAvailability(item.seasonalAvailability || '');
      setNote(item.note || '');
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
  
  // Dietary & Extra State
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState('');
  const [calories, setCalories] = useState('');
  const [spicinessLevel, setSpicinessLevel] = useState(1);
  const [allergens, setAllergens] = useState<string[]>([]);
  
  // Advanced Feature Toggles
  const [isSpicyToggle, setIsSpicyToggle] = useState(false);
  const [isAlcoholic, setIsAlcoholic] = useState(false);
  const [abv, setAbv] = useState('');
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [seasonalAvailability, setSeasonalAvailability] = useState('');
  const [note, setNote] = useState('');
  
  // Promo Drawer State
  const [isPromoDrawerMounted, setIsPromoDrawerMounted] = useState(false);
  const [isPromoDrawerVisible, setIsPromoDrawerVisible] = useState(false);
  const [activePromoTab, setActivePromoTab] = useState<'promotions' | 'sliders'>('promotions');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [sliderItemsState, setSliderItemsState] = useState<Record<string, {
    isFeatured: boolean;
    featuredPosition?: number;
    featuredBadge?: string;
    type?: 'item' | 'promo';
  }>>({});
  const [savingPromos, setSavingPromos] = useState(false);
  
  // Standalone Promotion Form State
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [isPromoFormVisible, setIsPromoFormVisible] = useState(false);
  const [promoName, setPromoName] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoImgUrl, setPromoImgUrl] = useState('');
  const [promoType, setPromoType] = useState<'discount' | 'bogo' | 'combo' | 'spend_more'>('discount');
  const [promoDiscountType, setPromoDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [promoDiscountValue, setPromoDiscountValue] = useState('');
  const [promoMinOrderValue, setPromoMinOrderValue] = useState('');
  const [promoApplicableItems, setPromoApplicableItems] = useState<string[]>([]);
  const [promoRequiredItems, setPromoRequiredItems] = useState<string[]>([]);
  const [promoIsActive, setPromoIsActive] = useState(true);
  const [promoImageFile, setPromoImageFile] = useState<File | null>(null);
  const [promoImagePreview, setPromoImagePreview] = useState('');
  
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
    fetchPromotions();
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

  const fetchPromotions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/promotions');
      const data = await res.json();
      setPromotions(data);
    } catch (err) {
      console.error(err);
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
    setPrepTime('');
    setCalories('');
    setSpicinessLevel(1);
    setAllergens([]);
    setIsSpicyToggle(false);
    setIsAlcoholic(false);
    setAbv('');
    setIsSeasonal(false);
    setSeasonalAvailability('');
    setNote('');
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
          dietaryPreferences,
          prepTime: prepTime ? parseInt(prepTime) : null,
          calories: calories ? parseInt(calories) : null,
          spicinessLevel: isSpicyToggle ? spicinessLevel : 0,
          allergens,
          isAlcoholic,
          abv: isAlcoholic && abv ? parseFloat(abv) : null,
          isSeasonal,
          seasonalAvailability: isSeasonal ? seasonalAvailability : null,
          note
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
    if (!(await confirm('Are you sure you want to delete this item?'))) return;
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
        type: 'item'
      };
    });
    promotions.forEach(promo => {
      initialState[promo._id] = {
        isFeatured: promo.isFeatured || false,
        featuredPosition: promo.featuredPosition || 1,
        featuredBadge: promo.featuredBadge || 'Promo',
        type: 'promo'
      };
    });
    setSliderItemsState(initialState);
    setActivePromoTab('promotions');
    setIsPromoDrawerMounted(true);
    setTimeout(() => setIsPromoDrawerVisible(true), 10);
  };

  const closePromoDrawer = () => {
    setIsPromoDrawerVisible(false);
    setTimeout(() => {
      setIsPromoDrawerMounted(false);
      // Reset forms if needed
    }, 300);
  };

  const handleSaveSliders = async () => {
    setSavingPromos(true);
    try {
      const promises: Promise<any>[] = [];
      
      items.forEach(item => {
        const sliderState = sliderItemsState[item._id];
        if (!sliderState) return;
        promises.push(
          fetch(`http://localhost:5000/api/menu/${item._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              isFeatured: sliderState.isFeatured,
              featuredPosition: sliderState.isFeatured ? sliderState.featuredPosition : null,
              featuredBadge: sliderState.isFeatured ? sliderState.featuredBadge : null
            })
          })
        );
      });

      promotions.forEach(promo => {
        const sliderState = sliderItemsState[promo._id];
        if (!sliderState) return;
        const token = localStorage.getItem('token');
        // Actually our backend route for promotions doesn't have PATCH, we use PUT.
        // We will just PUT the entire updated object with the slider fields, or we can use PUT.
        // Wait, PUT requires all fields. Let's send everything from the promo object + slider fields.
        const payload = { ...promo, 
          isFeatured: sliderState.isFeatured,
          featuredPosition: sliderState.isFeatured ? sliderState.featuredPosition : null,
          featuredBadge: sliderState.isFeatured ? sliderState.featuredBadge : null
        };
        promises.push(
          fetch(`http://localhost:5000/api/promotions/${promo._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        );
      });

      await Promise.all(promises);
      fetchItems();
      fetchPromotions();
      await alert({ message: 'Sliders saved successfully!', type: 'success' });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPromos(false);
    }
  };

  const handleSavePromoForm = async () => {
    if (!promoName) return await alert({ message: 'Name is required', type: 'error' });
    if (!promoDiscountValue) return await alert({ message: 'Discount value is required', type: 'error' });
    
    setSavingPromos(true);
    try {
      let finalImageUrl = promoImgUrl;
      if (promoImageFile) {
        const formData = new FormData();
        formData.append('image', promoImageFile);
        const uploadRes = await fetch('http://localhost:5000/api/menu/upload', {
          method: 'POST',
          body: formData
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          finalImageUrl = data.imageUrl;
        }
      }

      const payload = {
        name: promoName,
        description: promoDesc,
        imageUrl: finalImageUrl,
        promoType: promoType,
        discountType: promoDiscountType,
        discountValue: parseFloat(promoDiscountValue) || 0,
        minOrderValue: promoType === 'spend_more' ? parseFloat(promoMinOrderValue) || 0 : 0,
        applicableItemIds: promoApplicableItems,
        requiredItemIds: promoType === 'combo' ? promoRequiredItems : [],
        isActive: promoIsActive
      };

      const url = editingPromoId 
        ? `http://localhost:5000/api/promotions/${editingPromoId}`
        : `http://localhost:5000/api/promotions`;
      const method = editingPromoId ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to save promotion');
      }
      
      setIsPromoFormVisible(false);
      fetchPromotions();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPromos(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!(await confirm({ message: 'Delete this promotion?', type: 'warning' }))) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      fetchPromotions();
    } catch (err) {
      console.error(err);
    }
  };

  const openPromoForm = (promo?: Promotion) => {
    if (promo) {
      setEditingPromoId(promo._id);
      setPromoName(promo.name);
      setPromoDesc(promo.description || '');
      setPromoImgUrl(promo.imageUrl || '');
      setPromoType(promo.promoType);
      setPromoDiscountType(promo.discountType);
      setPromoDiscountValue(promo.discountValue.toString());
      setPromoMinOrderValue(promo.minOrderValue ? promo.minOrderValue.toString() : '');
      setPromoApplicableItems(promo.applicableItemIds.map(i => i._id || i));
      setPromoRequiredItems(promo.requiredItemIds.map(i => i._id || i));
      setPromoIsActive(promo.isActive);
      setPromoImageFile(null);
      setPromoImagePreview('');
    } else {
      setEditingPromoId(null);
      setPromoName('');
      setPromoDesc('');
      setPromoImgUrl('');
      setPromoType('discount');
      setPromoDiscountType('PERCENTAGE');
      setPromoDiscountValue('');
      setPromoMinOrderValue('');
      setPromoApplicableItems([]);
      setPromoRequiredItems([]);
      setPromoIsActive(true);
      setPromoImageFile(null);
      setPromoImagePreview('');
    }
    setIsPromoFormVisible(true);
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
            className={`w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 border-l border-zinc-200 ${isDrawerVisible ? 'translate-x-0' : 'translate-x-full'}`}
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

                {/* Additional Info Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Prep Time (mins)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={prepTime}
                      onChange={e => setPrepTime(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Calories (kcal)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={calories}
                      onChange={e => setCalories(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Advanced Properties Section */}
                <div className="space-y-4">
                  {/* Spiciness Toggle */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900">Is this item spicy?</span>
                      <button 
                        type="button"
                        onClick={() => setIsSpicyToggle(!isSpicyToggle)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isSpicyToggle ? 'bg-red-500' : 'bg-zinc-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isSpicyToggle ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {isSpicyToggle && (
                      <div className="mt-3 pt-3 border-t border-zinc-200 flex gap-2">
                        {[1, 2, 3].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSpicinessLevel(level)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border flex-1 flex justify-center ${
                              spicinessLevel === level 
                                ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' 
                                : 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50'
                            }`}
                          >
                            {Array(level).fill('🌶️').join('')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Alcoholic Toggle */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900">Does this contain alcohol?</span>
                      <button 
                        type="button"
                        onClick={() => setIsAlcoholic(!isAlcoholic)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isAlcoholic ? 'bg-zinc-900' : 'bg-zinc-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isAlcoholic ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {isAlcoholic && (
                      <div className="mt-3 pt-3 border-t border-zinc-200">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">ABV Percentage (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          step="0.1"
                          value={abv}
                          onChange={e => setAbv(e.target.value)}
                          placeholder="e.g. 5.5"
                          className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Seasonal Toggle */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900">Is this a seasonal item?</span>
                      <button 
                        type="button"
                        onClick={() => setIsSeasonal(!isSeasonal)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isSeasonal ? 'bg-zinc-900' : 'bg-zinc-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isSeasonal ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    {isSeasonal && (
                      <div className="mt-3 pt-3 border-t border-zinc-200">
                        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Seasonal Description</label>
                        <input 
                          type="text" 
                          value={seasonalAvailability}
                          onChange={e => setSeasonalAvailability(e.target.value)}
                          placeholder="e.g. Summer Special"
                          className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Dietary Preferences Section */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">Dietary Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    {["Vegetarian", "Vegan", "Gluten-Free", "Pescatarian", "Halal"].map(diet => (
                      <button 
                        key={diet}
                        type="button"
                        onClick={() => {
                          if (dietaryPreferences.includes(diet)) {
                            setDietaryPreferences(dietaryPreferences.filter(d => d !== diet));
                          } else {
                            setDietaryPreferences([...dietaryPreferences, diet]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          dietaryPreferences.includes(diet)
                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {diet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allergens Section */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-2">Contains Allergens</label>
                  <div className="flex flex-wrap gap-2">
                    {["Dairy", "Nuts", "Soy", "Eggs", "Shellfish", "Wheat"].map(allergen => (
                      <button 
                        key={allergen}
                        type="button"
                        onClick={() => {
                          if (allergens.includes(allergen)) {
                            setAllergens(allergens.filter(a => a !== allergen));
                          } else {
                            setAllergens([...allergens, allergen]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          allergens.includes(allergen)
                            ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {allergen}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Customizations */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-zinc-900">Customization Groups</label>
                    <button 
                      type="button" 
                      onClick={handleAddGroup}
                      className="text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={14} /> Add Group
                    </button>
                  </div>

                  <div className="space-y-5">
                    {customizationGroups.length === 0 && (
                      <div className="py-8 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-white border border-zinc-200 rounded-full shadow-sm flex items-center justify-center mb-3 text-zinc-400">
                          <Plus size={20} />
                        </div>
                        <p className="text-sm font-semibold text-zinc-900">No Customizations</p>
                        <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Add groups like "Size" or "Toppings" to give customers choices.</p>
                      </div>
                    )}
                    
                    {customizationGroups.map((group, gIdx) => (
                      <div key={gIdx} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Group Header */}
                        <div className="bg-zinc-50 p-4 border-b border-zinc-200 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <input 
                              type="text" 
                              required 
                              placeholder="Group Name (e.g. Size, Toppings)"
                              value={group.name}
                              onChange={e => handleGroupChange(gIdx, { name: e.target.value })}
                              className="w-2/3 bg-white text-zinc-900 font-bold border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:font-normal placeholder:text-zinc-400"
                            />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveGroup(gIdx)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors bg-white border border-zinc-200 shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <div className="relative flex items-center">
                                <input 
                                  type="checkbox"
                                  className="sr-only"
                                  checked={group.required}
                                  onChange={e => handleGroupChange(gIdx, { required: e.target.checked })}
                                />
                                <div className={`w-9 h-5 rounded-full transition-colors ${group.required ? 'bg-zinc-900' : 'bg-zinc-300'}`}></div>
                                <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${group.required ? 'translate-x-4' : ''}`}></div>
                              </div>
                              <span className="text-xs font-semibold text-zinc-700">Required Selection</span>
                            </label>
                            
                            <div className="w-px h-4 bg-zinc-300"></div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-700">Max Select:</span>
                              <input 
                                type="number" 
                                min={1} 
                                value={group.maxSelect}
                                onChange={e => handleGroupChange(gIdx, { maxSelect: parseInt(e.target.value) || 1 })}
                                className="w-14 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-sm text-center focus:border-zinc-900 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Options */}
                        <div className="p-4 space-y-3 bg-white">
                          {group.options.map((option, oIdx) => (
                            <div key={oIdx} className="flex gap-3 items-center group/option">
                              <div className="w-6 flex justify-center text-zinc-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                              </div>
                              <input 
                                type="text" 
                                required 
                                placeholder="Option Name" 
                                value={option.name}
                                onChange={e => handleOptionChange(gIdx, oIdx, { name: e.target.value })}
                                className="flex-1 bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 outline-none"
                              />
                              <div className="relative w-28">
                                <span className="absolute left-3 top-2.5 text-sm text-zinc-400">$</span>
                                <input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00" 
                                  value={option.price}
                                  onChange={e => handleOptionChange(gIdx, oIdx, { price: e.target.value })}
                                  className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:border-zinc-900 outline-none"
                                />
                              </div>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveOption(gIdx, oIdx)}
                                disabled={group.options.length <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          
                          <div className="pl-9 pr-11 mt-3">
                            <button 
                              type="button" 
                              onClick={() => handleAddOption(gIdx)}
                              className="w-full py-2 border border-dashed border-zinc-300 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-400 transition-all flex items-center justify-center gap-1.5"
                            >
                              <Plus size={14} /> Add Option
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Internal Note Section */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Internal Note (Optional)</label>
                  <textarea 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={2}
                    placeholder="e.g. Takes 20 minutes to prepare, ask for extra cheese."
                    className="w-full bg-white text-zinc-900 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all placeholder:text-zinc-400 resize-none"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">This note will be visible to staff only.</p>
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
      {isPromoDrawerMounted && (
        <>
          <div 
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isPromoDrawerVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => closePromoDrawer()}
          />
          <div className={`fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[100] flex flex-col transform transition-transform duration-300 border-l border-zinc-200 ${isPromoDrawerVisible ? 'translate-x-0' : 'translate-x-full'}`}>
            
            {/* Drawer Header */}
            <div className="flex flex-col border-b border-zinc-100 bg-zinc-50/50">
              <div className="flex justify-between items-center px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <span className="text-zinc-400">🏷️</span> Promotions & Sliders
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Manage marketing campaigns and featured menu items</p>
                </div>
                <button 
                  onClick={() => closePromoDrawer()}
                  className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400 hover:text-zinc-600 bg-white border border-zinc-200 shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex px-6 gap-6 border-t border-zinc-200 bg-white">
                <button 
                  onClick={() => setActivePromoTab('promotions')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activePromoTab === 'promotions' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                >
                  Promotions
                </button>
                <button 
                  onClick={() => setActivePromoTab('sliders')}
                  className={`py-3 text-sm font-semibold border-b-2 transition-colors ${activePromoTab === 'sliders' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                >
                  Featured Sliders
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/30 custom-scrollbar relative">
              {activePromoTab === 'sliders' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 mb-4 border-b border-zinc-200 pb-2">Active Promotions</h3>
                    <div className="space-y-4">
                      {promotions.map(promo => {
                        const slider = sliderItemsState[promo._id];
                        if (!slider || slider.type !== 'promo') return null;
                        return (
                          <div key={promo._id} className="bg-white border border-zinc-200 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:border-zinc-300 transition-colors">
                            <div className="w-16 h-16 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {promo.imageUrl ? (
                                <img src={promo.imageUrl} alt={promo.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">🏷️</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-zinc-900 text-sm">{promo.name}</h3>
                              <p className="text-xs text-zinc-500">{promo.promoType.toUpperCase()}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-zinc-700">Show in Slider?</span>
                                <button 
                                  type="button"
                                  onClick={() => setSliderItemsState(prev => ({ ...prev, [promo._id]: { ...prev[promo._id], isFeatured: !slider.isFeatured } }))}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${slider.isFeatured ? 'bg-zinc-900' : 'bg-zinc-300'}`}
                                >
                                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${slider.isFeatured ? 'translate-x-4' : 'translate-x-1'}`} />
                                </button>
                              </div>
                              {slider.isFeatured && (
                                <div className="flex gap-2">
                                  <select 
                                    value={slider.featuredPosition}
                                    onChange={(e) => setSliderItemsState(prev => ({ ...prev, [promo._id]: { ...prev[promo._id], featuredPosition: parseInt(e.target.value) } }))}
                                    className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-zinc-900 outline-none"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>Pos {n}</option>)}
                                  </select>
                                  <select 
                                    value={slider.featuredBadge}
                                    onChange={(e) => setSliderItemsState(prev => ({ ...prev, [promo._id]: { ...prev[promo._id], featuredBadge: e.target.value } }))}
                                    className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-zinc-900 outline-none"
                                  >
                                    <option value="Promo">Promo</option>
                                    <option value="Hot Deal">Hot Deal</option>
                                    <option value="Limited">Limited</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 mb-4 border-b border-zinc-200 pb-2">Menu Items</h3>
                    <div className="space-y-4">
                      {items.map(item => {
                        const slider = sliderItemsState[item._id];
                        if (!slider || slider.type !== 'item') return null;
                        return (
                          <div key={item._id} className="bg-white border border-zinc-200 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:border-zinc-300 transition-colors">
                            <img src={item.imageUrl || ''} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-100" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-zinc-900 text-sm">{item.name}</h3>
                              <p className="text-xs text-zinc-500">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-zinc-700">Show in Slider?</span>
                                <button 
                                  type="button"
                                  onClick={() => setSliderItemsState(prev => ({ ...prev, [item._id]: { ...prev[item._id], isFeatured: !slider.isFeatured } }))}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${slider.isFeatured ? 'bg-zinc-900' : 'bg-zinc-300'}`}
                                >
                                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${slider.isFeatured ? 'translate-x-4' : 'translate-x-1'}`} />
                                </button>
                              </div>
                              {slider.isFeatured && (
                                <div className="flex gap-2">
                                  <select 
                                    value={slider.featuredPosition}
                                    onChange={(e) => setSliderItemsState(prev => ({ ...prev, [item._id]: { ...prev[item._id], featuredPosition: parseInt(e.target.value) } }))}
                                    className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-zinc-900 outline-none"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>Pos {n}</option>)}
                                  </select>
                                  <select 
                                    value={slider.featuredBadge}
                                    onChange={(e) => setSliderItemsState(prev => ({ ...prev, [item._id]: { ...prev[item._id], featuredBadge: e.target.value } }))}
                                    className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs focus:ring-1 focus:ring-zinc-900 outline-none"
                                  >
                                    <option value="Sale">Sale</option>
                                    <option value="Combo">Combo</option>
                                    <option value="Popular">Popular</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activePromoTab === 'promotions' && !isPromoFormVisible && (
                <div className="space-y-6">
                  {/* Grid Layout for Promotions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => openPromoForm()}
                      className="w-full h-full min-h-[140px] border-2 border-dashed border-zinc-300 rounded-2xl text-zinc-500 hover:text-zinc-900 hover:border-zinc-900 hover:bg-zinc-50 transition-all font-semibold flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-1">
                        <span className="text-xl">+</span>
                      </div>
                      Create Promotion
                    </button>

                    {promotions.map(promo => (
                      <div key={promo._id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-300 transition-all group flex flex-col">
                        <div className="h-28 bg-zinc-100 relative">
                          {promo.imageUrl ? (
                            <img src={promo.imageUrl} alt={promo.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                              <span className="text-4xl">🏷️</span>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className="bg-white/90 backdrop-blur-sm text-zinc-900 text-[10px] px-2 py-1 rounded-md font-bold tracking-wide uppercase shadow-sm">
                              {promo.promoType}
                            </span>
                            {!promo.isActive && (
                              <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md font-bold tracking-wide uppercase shadow-sm">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-zinc-900 leading-tight">{promo.name}</h3>
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{promo.description || 'No description provided.'}</p>
                          </div>
                          <div className="flex justify-between items-end mt-4">
                            <span className="text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                              {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                            </span>
                            <div className="flex gap-1">
                              <button onClick={() => openPromoForm(promo)} className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeletePromo(promo._id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X size={16} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePromoTab === 'promotions' && isPromoFormVisible && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                    <h3 className="font-bold text-zinc-900">{editingPromoId ? 'Edit Promotion' : 'Create Promotion'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-600">Active</span>
                      <button 
                        type="button"
                        onClick={() => setPromoIsActive(!promoIsActive)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${promoIsActive ? 'bg-zinc-900' : 'bg-zinc-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${promoIsActive ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-800 mb-1">Promotion Name</label>
                        <input 
                          type="text"
                          value={promoName}
                          onChange={e => setPromoName(e.target.value)}
                          placeholder="e.g. Summer Combo Deal"
                          className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none transition-shadow"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-zinc-800 mb-1">Description <span className="text-zinc-400 font-normal">(Optional)</span></label>
                        <textarea 
                          value={promoDesc}
                          onChange={e => setPromoDesc(e.target.value)}
                          placeholder="Short description of this promo..."
                          className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none resize-none h-20 transition-shadow"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-zinc-800 mb-2">Promotional Image</label>
                        <div className="flex gap-4 items-center">
                          <div className="w-20 h-20 bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {(promoImagePreview || promoImgUrl) ? (
                              <img src={promoImagePreview || promoImgUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl opacity-30">🖼️</span>
                            )}
                          </div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setPromoImageFile(file);
                                setPromoImagePreview(URL.createObjectURL(file));
                              }
                            }}
                            className="text-sm text-zinc-600 file:mr-4 file:py-2 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 transition-colors cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-sm font-semibold text-zinc-800 mb-1">Deal Type</label>
                          <select 
                            value={promoType}
                            onChange={e => {
                              setPromoType(e.target.value as any);
                              setPromoRequiredItems([]);
                              setPromoApplicableItems([]);
                            }}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none transition-shadow"
                          >
                            <option value="discount">Standard Discount</option>
                            <option value="bogo">Buy One Get One</option>
                            <option value="combo">Combo Deal</option>
                            <option value="spend_more">Spend More</option>
                          </select>
                        </div>

                        {promoType === 'spend_more' ? (
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-semibold text-zinc-800 mb-1">Minimum Spend</label>
                            <div className="relative">
                              <span className="absolute left-4 top-2.5 text-sm text-zinc-500 font-medium">$</span>
                              <input 
                                type="number"
                                value={promoMinOrderValue}
                                onChange={e => setPromoMinOrderValue(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none transition-shadow"
                              />
                            </div>
                          </div>
                        ) : null}

                        <div className="col-span-2 sm:col-span-1 flex gap-2">
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-zinc-800 mb-1">Discount</label>
                            <input 
                              type="number"
                              value={promoDiscountValue}
                              onChange={e => setPromoDiscountValue(e.target.value)}
                              placeholder="Value"
                              className="w-full bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none transition-shadow"
                            />
                          </div>
                          <div className="w-24">
                            <label className="block text-sm font-semibold text-zinc-800 mb-1">Unit</label>
                            <select 
                              value={promoDiscountType}
                              onChange={e => setPromoDiscountType(e.target.value as any)}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-zinc-900 outline-none transition-shadow"
                            >
                              <option value="PERCENTAGE">%</option>
                              <option value="FLAT">$</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {promoType === 'bogo' && (
                        <div className="pt-4 border-t border-zinc-100">
                          <label className="block text-sm font-semibold text-zinc-800 mb-2">Select BOGO Item</label>
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar bg-white p-1">
                            {items.map(item => {
                              const isSelected = promoApplicableItems.includes(item._id);
                              return (
                                <button
                                  key={item._id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) setPromoApplicableItems(prev => prev.filter(id => id !== item._id));
                                    else setPromoApplicableItems(prev => [...prev, item._id]);
                                  }}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    isSelected 
                                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                                  }`}
                                >
                                  {isSelected && <CheckCircle2 size={14} />}
                                  {item.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {promoType === 'combo' && (
                        <div className="pt-4 border-t border-zinc-100">
                          <label className="block text-sm font-semibold text-zinc-800 mb-2">Select Combo Items</label>
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar bg-white p-1">
                            {items.map(item => {
                              const isSelected = promoRequiredItems.includes(item._id);
                              return (
                                <button
                                  key={item._id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) setPromoRequiredItems(prev => prev.filter(id => id !== item._id));
                                    else setPromoRequiredItems(prev => [...prev, item._id]);
                                  }}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    isSelected 
                                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                                  }`}
                                >
                                  {isSelected && <CheckCircle2 size={14} />}
                                  {item.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {promoType === 'discount' && (
                        <div className="pt-4 border-t border-zinc-100">
                          <label className="block text-sm font-semibold text-zinc-800 mb-2">Applicable Items</label>
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar bg-white p-1">
                            {items.map(item => {
                              const isSelected = promoApplicableItems.includes(item._id);
                              return (
                                <button
                                  key={item._id}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) setPromoApplicableItems(prev => prev.filter(id => id !== item._id));
                                    else setPromoApplicableItems(prev => [...prev, item._id]);
                                  }}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                    isSelected 
                                      ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                                  }`}
                                >
                                  {isSelected && <CheckCircle2 size={14} />}
                                  {item.name}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>

                  <div className="flex gap-3 pt-4 border-t border-zinc-100">
                    <button 
                      onClick={() => setIsPromoFormVisible(false)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                    >
                      Cancel Form
                    </button>
                    <button 
                      onClick={handleSavePromoForm}
                      disabled={savingPromos}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 shadow-sm transition-colors disabled:opacity-50"
                    >
                      {savingPromos ? 'Saving...' : 'Save Promotion'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer (Only visible if not in form) */}
            {!isPromoFormVisible && (
              <div className="p-6 border-t border-zinc-100 bg-white flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => closePromoDrawer()}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors"
                >
                  Close Drawer
                </button>
                {activePromoTab === 'sliders' && (
                  <button 
                    type="button"
                    onClick={handleSaveSliders}
                    disabled={savingPromos}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {savingPromos ? 'Saving...' : 'Save Sliders'}
                  </button>
                )}
              </div>
            )}
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