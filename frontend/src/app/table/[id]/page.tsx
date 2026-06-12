"use client";

import { useEffect, useState, use, useRef } from 'react';
import { useCartStore, SelectedCustomizationOption } from '@/store/cartStore';
import { io, Socket } from 'socket.io-client';

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

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  selectedCustomizations?: SelectedCustomizationOption[];
}

interface Order {
  _id: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  createdAt: string;
}

const BACKEND_URL = 'http://localhost:5000';

// Exact categories from admin drop down
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

// Beautiful inline SVG Icons (Synchronized with Gourmet Green theme)
const Icons = {
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Cart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.02 6.02 0 00-4.9-5.907 2.62 2.62 0 00-4.2 0A6.02 6.02 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
    </svg>
  ),
  Check: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Notes: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
};

export default function TableMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [orderStatus, setOrderStatus] = useState<'success' | 'error' | 'submitting' | null>(null);
  
  // Customization modal state
  const [activeCustomizationItem, setActiveCustomizationItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [groupName: string]: SelectedCustomizationOption[] }>({});

  // Navigation state (SPA architecture inside mobile container)
  const [currentTab, setCurrentTab] = useState<'menu' | 'cart' | 'orders'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Table active orders state
  const [tableOrders, setTableOrders] = useState<Order[]>([]);

  // Waiter request state
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [waiterRequestStatus, setWaiterRequestStatus] = useState<'idle' | 'selecting' | 'sending' | 'success'>('idle');
  const [waiterReason, setWaiterReason] = useState<string>('General Assistance');
  const [waiterCalled, setWaiterCalled] = useState(false);

  // Unwrap params
  const { id: tableId } = use(params);
  
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Fetch Menu & Orders initially and connect WebSocket for live updates
  useEffect(() => {
    // 1. Fetch menu
    fetch(`${BACKEND_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data);
        if (data.length > 0) {
          // Initialize active category matching RESTAURANT_CATEGORIES order
          const sortedCats = [
            ...RESTAURANT_CATEGORIES.filter(cat => data.some((item: MenuItem) => item.category === cat)),
            ...Array.from(new Set(data.map((item: MenuItem) => item.category))).filter((cat: any) => !RESTAURANT_CATEGORIES.includes(cat))
          ] as string[];
          
          if (sortedCats.length > 0) {
            setActiveCategory(sortedCats[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching menu:', err);
        setLoading(false);
      });

    // 2. Fetch table orders
    fetch(`${BACKEND_URL}/api/orders?tableNumber=${tableId}`)
      .then((res) => res.json())
      .then((data) => setTableOrders(data))
      .catch((err) => console.error('Error fetching orders:', err));

    // 3. Connect to WebSocket
    const socket: Socket = io(BACKEND_URL);

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('new-order', (order: Order) => {
      if (order.tableNumber === tableId) {
        setTableOrders((prev) => [order, ...prev]);
      }
    });

    socket.on('order-updated', (updatedOrder: Order) => {
      if (updatedOrder.tableNumber === tableId) {
        setTableOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [tableId]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setOrderStatus('submitting');
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableId,
          items: items.map(i => ({
            menuItem: i._id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            selectedCustomizations: i.selectedCustomizations
          })),
          totalAmount: getTotal()
        })
      });
      
      if (res.ok) {
        clearCart();
        setOrderStatus('success');
        setOrderNotes('');
        
        // Fetch orders immediately to show it in the Orders list
        const updatedOrdersRes = await fetch(`${BACKEND_URL}/api/orders?tableNumber=${tableId}`);
        const updatedOrdersData = await updatedOrdersRes.json();
        setTableOrders(updatedOrdersData);

        // Transition to "Orders" tab to track preparation status live!
        setTimeout(() => {
          setOrderStatus(null);
          setCurrentTab('orders');
        }, 1500);
      } else {
        setOrderStatus('error');
      }
    } catch (err) {
      console.error(err);
      setOrderStatus('error');
    }
  };

  const handleAddClick = (item: MenuItem) => {
    if (item.customizationGroups && item.customizationGroups.length > 0) {
      setActiveCustomizationItem(item);
      const initial: { [groupName: string]: SelectedCustomizationOption[] } = {};
      item.customizationGroups.forEach(g => {
        if (g.required && g.maxSelect === 1 && g.options.length > 0) {
          initial[g.name] = [{
            groupName: g.name,
            optionName: g.options[0].name,
            price: g.options[0].price
          }];
        } else {
          initial[g.name] = [];
        }
      });
      setSelectedOptions(initial);
    } else {
      addItem({
        _id: item._id,
        name: item.name,
        price: item.price,
        selectedCustomizations: []
      });
    }
  };

  const handleOptionToggle = (group: CustomizationGroup, option: CustomizationOption) => {
    const currentList = selectedOptions[group.name] || [];
    const isChecked = currentList.some(o => o.optionName === option.name);

    if (group.maxSelect === 1) {
      if (isChecked && !group.required) {
        setSelectedOptions(prev => ({ ...prev, [group.name]: [] }));
      } else {
        setSelectedOptions(prev => ({
          ...prev,
          [group.name]: [{ groupName: group.name, optionName: option.name, price: option.price }]
        }));
      }
    } else {
      if (isChecked) {
        setSelectedOptions(prev => ({
          ...prev,
          [group.name]: currentList.filter(o => o.optionName !== option.name)
        }));
      } else {
        if (currentList.length < group.maxSelect) {
          setSelectedOptions(prev => ({
            ...prev,
            [group.name]: [...currentList, { groupName: group.name, optionName: option.name, price: option.price }]
          }));
        }
      }
    }
  };

  const getCustomizationPrice = () => {
    let total = 0;
    Object.values(selectedOptions).forEach(list => {
      list.forEach(o => {
        total += o.price;
      });
    });
    return total;
  };

  const isAddDisabled = () => {
    if (!activeCustomizationItem) return true;
    for (const group of activeCustomizationItem.customizationGroups || []) {
      if (group.required) {
        const selections = selectedOptions[group.name] || [];
        if (selections.length < group.minSelect) {
          return true;
        }
      }
    }
    return false;
  };

  const handleConfirmAdd = () => {
    if (!activeCustomizationItem || isAddDisabled()) return;

    const flatCustomizations: SelectedCustomizationOption[] = [];
    Object.values(selectedOptions).forEach(list => {
      flatCustomizations.push(...list);
    });

    addItem({
      _id: activeCustomizationItem._id,
      name: activeCustomizationItem.name,
      price: activeCustomizationItem.price,
      selectedCustomizations: flatCustomizations
    });

    setActiveCustomizationItem(null);
  };

  const selectCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    
    // Scroll the clicked pill into view
    const pillElement = document.getElementById(`pill-${categoryName}`);
    if (pillElement && categoriesRef.current) {
      const container = categoriesRef.current;
      const scrollLeft = pillElement.offsetLeft - container.offsetWidth / 2 + pillElement.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  // Helper functions for cart state on food card list
  const getCartItemQuantity = (itemId: string) => {
    return items.filter(i => i._id === itemId).reduce((sum, i) => sum + i.quantity, 0);
  };

  const getSingleCartItem = (itemId: string) => {
    const match = items.filter(i => i._id === itemId);
    return match.length === 1 ? match[0] : null;
  };

  // Trigger waiter assistant
  const handleCallWaiter = () => {
    setWaiterRequestStatus('selecting');
    setWaiterModalOpen(true);
  };

  const submitCallWaiter = () => {
    setWaiterRequestStatus('sending');
    setTimeout(() => {
      setWaiterRequestStatus('success');
      setWaiterCalled(true);
      setTimeout(() => {
        setWaiterModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const cancelWaiter = () => {
    setWaiterCalled(false);
  };

  // Filter categories to only those containing items, ordered by RESTAURANT_CATEGORIES first
  const activeMenuCategories = [
    ...RESTAURANT_CATEGORIES.filter(cat => menuItems.some(item => item.category === cat)),
    ...Array.from(new Set(menuItems.map(item => item.category))).filter((cat: any) => !RESTAURANT_CATEGORIES.includes(cat))
  ];

  const cartTotalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  // Filter items by search
  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get active items to display (only from current active category, or show search results)
  const displayItems = searchQuery 
    ? filteredMenuItems 
    : menuItems.filter(item => item.category === activeCategory);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#FAF9F5]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#2E6F40]/20 border-t-[#2E6F40] rounded-full animate-spin"></div>
        <div className="text-xs font-bold text-[#2E6F40] uppercase tracking-widest animate-pulse">Loading Gourmet Menu...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] md:bg-zinc-100 flex justify-center py-0 md:py-6 antialiased">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md bg-[#FAF9F5] min-h-screen md:min-h-[85vh] md:max-h-[92vh] md:rounded-[40px] md:shadow-2xl flex flex-col relative overflow-hidden border-0 md:border-[10px] md:border-zinc-800">
        
        {/* Header */}
        <header className="bg-white/85 backdrop-blur-md border-b border-[#E0E6DF] sticky top-0 z-30 px-5 py-3.5 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-[#1A2F1C] leading-tight flex items-center gap-1.5">
              <span className="text-[#2E6F40]">Dollyva</span>
            </h1>
            <span className="text-[10px] font-semibold text-[#6B7A68] uppercase tracking-wider">Smart Ordering</span>
          </div>

          <div className="flex items-center gap-2">
            {waiterCalled ? (
              <button 
                onClick={cancelWaiter}
                className="bg-[#E8F5E9] text-[#2E6F40] border border-[#C8E6C9] px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 animate-pulse cursor-pointer hover:bg-[#C8E6C9]/40 transition-colors"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E6F40] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2E6F40]"></span>
                </span>
                Cancel Bell
              </button>
            ) : (
              <button 
                onClick={handleCallWaiter}
                className="bg-[#FAF9F5] border border-[#E0E6DF] text-[#6B7A68] hover:text-[#2E6F40] hover:border-[#C8E6C9] px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Icons.Bell />
                Call Waiter
              </button>
            )}
            
            <div className="bg-[#E8F5E9] text-[#2E6F40] border border-[#C8E6C9] px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase">
              Table {tableId}
            </div>
          </div>
        </header>

        {/* Dynamic Category Pill Bar - Sticky (Only shows on 'Menu' tab when not searching) */}
        {currentTab === 'menu' && activeMenuCategories.length > 0 && !searchQuery && (
          <div 
            ref={categoriesRef}
            className="bg-white/85 backdrop-blur-md border-b border-[#E0E6DF] sticky top-[57px] z-20 flex gap-2.5 overflow-x-auto whitespace-nowrap py-3 px-5 scrollbar-none shrink-0"
          >
            {activeMenuCategories.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  id={`pill-${category}`}
                  onClick={() => selectCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#2E6F40] text-white shadow-sm shadow-[#2E6F40]/20 scale-105 border border-[#2E6F40]'
                      : 'bg-white text-[#6B7A68] hover:text-[#2E6F40] border border-[#E0E6DF]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable View Panel */}
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-thin">
          
          {/* TAB 1: MENU VIEW */}
          {currentTab === 'menu' && (
            <div className="px-5 py-5">
              
              {/* Promo Banner */}
              <div className="bg-gradient-to-tr from-[#1E4620] to-[#3B8A50] rounded-3xl p-5 text-white mb-6 relative overflow-hidden shadow-md shadow-[#1E4620]/15">
                <div className="relative z-10">
                  <span className="bg-white/20 text-white font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full">Gourmet Dining</span>
                  <h2 className="text-xl font-extrabold mt-2 leading-tight">Order Fresh & Taste Delicious</h2>
                  <p className="text-white/85 text-xs mt-1 font-medium">Select customizable ingredients & order from your table.</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                  <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-10.03c2.09-.13 3.75-1.85 3.75-3.97V2h-2v7zm8-3h-3v5h3v11h2.5V3c-1.38 0-2.5 1.12-2.5 2.5v.5z"/>
                  </svg>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-white border border-[#E0E6DF] rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm mb-6 transition-all focus-within:border-[#2E6F40] focus-within:ring-1 focus-within:ring-[#2E6F40]/20">
                <span className="text-[#6B7A68]"><Icons.Search /></span>
                <input 
                  type="text" 
                  placeholder="Search dishes, drinks, desserts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs text-[#1A2F1C] focus:outline-none placeholder-[#8A9B86] font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-[#8A9B86] font-bold text-xs">✕</button>
                )}
              </div>

              {/* Search Header / Active Category Header */}
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xs font-black text-[#6B7A68] uppercase tracking-widest">
                  {searchQuery ? `Search Results (${displayItems.length})` : activeCategory}
                </h3>
                {!searchQuery && (
                  <span className="bg-[#FAF9F5] text-[10px] text-[#6B7A68] px-2 py-0.5 rounded-md border border-[#E0E6DF] font-bold">
                    {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>

              {/* Modern Product Card UI Grid - 2 columns */}
              {displayItems.length === 0 ? (
                <div className="py-12 text-center bg-white border border-[#E0E6DF] rounded-2xl">
                  <p className="text-[#6B7A68] text-xs font-semibold">No dishes found in this category.</p>
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs font-bold text-[#2E6F40] underline"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {displayItems.map((item) => {
                    const qtyInCart = getCartItemQuantity(item._id);
                    const singleCartItem = getSingleCartItem(item._id);
                    const hasCustomizations = item.customizationGroups && item.customizationGroups.length > 0;

                    return (
                      <div 
                        key={item._id} 
                        className="bg-white rounded-2xl border border-[#E0E6DF] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group"
                      >
                        {/* Top: 50% Height Product Image */}
                        <div className="relative w-full h-28 flex-shrink-0 bg-[#FAF9F5] border-b border-[#E0E6DF]">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className={`w-full h-full object-cover ${!item.isAvailable && 'grayscale brightness-50'}`} 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8A9B86] font-bold">
                              No Image
                            </div>
                          )}
                          
                          {/* Customizable Tag floating on image */}
                          {hasCustomizations && item.isAvailable && (
                            <span className="absolute top-2 left-2 text-[8px] font-extrabold uppercase tracking-wider text-[#2E6F40] bg-white border border-[#C8E6C9] px-1.5 py-0.5 rounded shadow-sm">
                              Customize
                            </span>
                          )}

                          {/* Sold Out Overlay */}
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Bottom: Product Details */}
                        <div className="p-3 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="font-extrabold text-[12px] text-[#1A2F1C] leading-snug truncate group-hover:text-[#2E6F40] transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[#6B7A68] text-[9.5px] line-clamp-2 leading-relaxed font-semibold mt-1">
                              {item.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-[#E0E6DF]/60 flex items-center justify-between gap-1.5">
                            {/* Price */}
                            <span className="font-black text-xs text-[#2E6F40]">
                              ${item.price.toFixed(2)}
                            </span>

                            {/* Overlapping Add Button / Quantity Controls */}
                            <div className="relative min-w-[50px]">
                              {item.isAvailable && qtyInCart > 0 ? (
                                hasCustomizations ? (
                                  <div className="flex flex-col items-center w-full relative">
                                    {/* Small floating cart count badge */}
                                    <span className="absolute -top-3.5 -right-1.5 bg-[#D32F2F] text-white text-[7.5px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                                      {qtyInCart}
                                    </span>
                                    <button 
                                      onClick={() => handleAddClick(item)}
                                      className="bg-[#2E6F40] hover:bg-[#1D4A2A] text-white text-[8.5px] font-extrabold px-2 py-1 rounded-lg shadow-sm transition-all cursor-pointer text-center uppercase tracking-wide flex items-center justify-center border border-[#2E6F40] h-6"
                                    >
                                      Add +
                                    </button>
                                  </div>
                                ) : (
                                  singleCartItem && (
                                    <div className="flex items-center bg-white border border-[#C8E6C9] rounded-lg p-0.5 justify-between shadow-sm h-6 gap-1">
                                      <button 
                                        onClick={() => singleCartItem.quantity > 1 ? updateQuantity(singleCartItem.cartId, singleCartItem.quantity - 1) : removeItem(singleCartItem.cartId)} 
                                        className="w-5.5 h-5.5 flex items-center justify-center text-[#2E6F40] font-black rounded hover:bg-[#E8F5E9] text-[10px] cursor-pointer"
                                      >
                                        <Icons.Minus />
                                      </button>
                                      <span className="font-extrabold text-[10px] text-[#2E6F40] min-w-[8px] text-center">{singleCartItem.quantity}</span>
                                      <button 
                                        onClick={() => updateQuantity(singleCartItem.cartId, singleCartItem.quantity + 1)} 
                                        className="w-5.5 h-5.5 flex items-center justify-center text-[#2E6F40] font-black rounded hover:bg-[#E8F5E9] text-[10px] cursor-pointer"
                                      >
                                        <Icons.Plus />
                                      </button>
                                    </div>
                                  )
                                )
                              ) : item.isAvailable ? (
                                <button 
                                  onClick={() => handleAddClick(item)}
                                  className="bg-white hover:bg-[#E8F5E9] text-[#2E6F40] border border-[#C8E6C9] text-[9.5px] font-black px-2.5 py-1 rounded-lg shadow-sm transition-all active:scale-[0.96] cursor-pointer text-center h-6 flex items-center justify-center uppercase tracking-wide"
                                >
                                  Add
                                </button>
                              ) : (
                                <span className="text-[9px] text-[#8A9B86] font-bold">Offline</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CART VIEW */}
          {currentTab === 'cart' && (
            <div className="px-5 py-5 flex flex-col min-h-full">
              <h2 className="text-base font-black text-[#1A2F1C] mb-1 flex items-center gap-2">
                <span>My Tray</span>
                <span className="bg-[#2E6F40] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartTotalQty}</span>
              </h2>
              <p className="text-[#6B7A68] text-xs font-semibold mb-6">Review items and place your order below.</p>

              {items.length === 0 ? (
                <div className="flex-1 py-16 flex flex-col items-center justify-center text-center bg-white border border-[#E0E6DF] rounded-3xl p-6 shadow-sm">
                  <div className="w-16 h-16 bg-[#E8F5E9] text-[#2E6F40] rounded-full flex items-center justify-center mb-4">
                    <Icons.Cart />
                  </div>
                  <h3 className="font-bold text-sm text-[#1A2F1C] mb-1">Your tray is empty</h3>
                  <p className="text-[#6B7A68] text-xs font-semibold max-w-[200px] leading-relaxed mb-6">Go to the menu and add items to place an order.</p>
                  <button 
                    onClick={() => setCurrentTab('menu')}
                    className="bg-[#2E6F40] hover:bg-[#1D4A2A] text-white text-xs font-bold py-2.5 px-6 rounded-full transition-all active:scale-95 shadow-md shadow-[#2E6F40]/15 cursor-pointer"
                  >
                    View Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Success / Error Messages */}
                  {orderStatus === 'success' && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-2xl font-bold text-center text-xs shadow-sm flex items-center justify-center gap-2 animate-bounce">
                      🎉 Order placed! Preparing your meal now...
                    </div>
                  )}

                  {orderStatus === 'error' && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl font-bold text-center text-xs shadow-sm flex items-center justify-center gap-2">
                      ⚠️ Failed to send order. Please notify wait staff.
                    </div>
                  )}

                  {/* Cart Items List */}
                  <div className="bg-white rounded-3xl border border-[#E0E6DF] p-4 divide-y divide-[#E0E6DF] shadow-sm">
                    {items.map(item => (
                      <div key={item.cartId} className="flex justify-between items-start py-3.5 first:pt-0 last:pb-0 gap-4">
                        <div className="flex-1">
                          <p className="text-xs.5 font-bold text-[#1A2F1C]">{item.name}</p>
                          {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                            <div className="text-[10px] text-[#6B7A68] mt-1 font-semibold flex flex-wrap gap-1 leading-normal">
                              {item.selectedCustomizations.map((c, idx) => (
                                <span key={idx} className="bg-[#FAF9F5] border border-[#E0E6DF] px-1.5 py-0.5 rounded">
                                  {c.optionName} (+${c.price.toFixed(2)})
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-[11px] text-[#8A9B86] font-bold mt-1.5">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg p-0.5 self-center">
                          <button 
                            onClick={() => item.quantity > 1 ? updateQuantity(item.cartId, item.quantity - 1) : removeItem(item.cartId)} 
                            className="w-6.5 h-6.5 flex items-center justify-center bg-white text-[#2E6F40] rounded-md font-black hover:bg-[#FAF9F5] shadow-sm text-xs cursor-pointer transition-transform active:scale-90"
                          >
                            <Icons.Minus />
                          </button>
                          <span className="font-extrabold text-xs w-4.5 text-center text-[#2E6F40]">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)} 
                            className="w-6.5 h-6.5 flex items-center justify-center bg-white text-[#2E6F40] rounded-md font-black hover:bg-[#FAF9F5] shadow-sm text-xs cursor-pointer transition-transform active:scale-90"
                          >
                            <Icons.Plus />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeItem(item.cartId)}
                          className="p-1 text-[#8A9B86] hover:text-red-650 self-center transition-colors cursor-pointer"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Kitchen Special Instructions / Order Notes */}
                  <div className="bg-white rounded-3xl border border-[#E0E6DF] p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-[#556B2F] font-bold text-xs">
                      <Icons.Notes />
                      <span>Special Instructions</span>
                    </div>
                    <textarea 
                      placeholder="E.g., No spicy toppings, sauce on the side, extra ice, etc."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full text-xs text-[#1A2F1C] bg-[#FAF9F5] border border-[#E0E6DF] rounded-xl p-3.5 focus:outline-none focus:border-[#2E6F40] placeholder-[#8A9B86] min-h-[70px] resize-none font-medium"
                    />
                  </div>

                  {/* Order Bill Summary */}
                  <div className="bg-white rounded-3xl border border-[#E0E6DF] p-5 shadow-sm space-y-2.5">
                    <div className="flex justify-between text-xs text-[#6B7A68] font-semibold">
                      <span>Subtotal</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6B7A68] font-semibold">
                      <span>Tax (10%)</span>
                      <span>${(getTotal() * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6B7A68] font-semibold">
                      <span>Service Charge</span>
                      <span className="text-emerald-700 font-bold">FREE</span>
                    </div>
                    <div className="border-t border-[#E0E6DF] pt-2.5 mt-2 flex justify-between text-[#1A2F1C] font-black">
                      <span className="text-xs uppercase tracking-wider">Total Amount</span>
                      <span className="text-base text-[#2E6F40]">${(getTotal() * 1.1).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={orderStatus === 'submitting' || items.length === 0}
                    className="w-full bg-[#2E6F40] hover:bg-[#1D4A2A] disabled:bg-zinc-350 text-white py-3.5 rounded-2xl font-extrabold text-xs.5 tracking-wider uppercase transition-all duration-200 shadow-md shadow-[#2E6F40]/25 active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {orderStatus === 'submitting' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Placing Order...
                      </>
                    ) : (
                      `Place Order — $${(getTotal() * 1.1).toFixed(2)}`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVE ORDERS VIEW */}
          {currentTab === 'orders' && (
            <div className="px-5 py-5 flex flex-col min-h-full">
              <h2 className="text-base font-black text-[#1A2F1C] mb-1">Kitchen Status</h2>
              <p className="text-[#6B7A68] text-xs font-semibold mb-6">Track your table's food preparations live.</p>

              {tableOrders.length === 0 ? (
                <div className="flex-1 py-16 flex flex-col items-center justify-center text-center bg-white border border-[#E0E6DF] rounded-3xl p-6 shadow-sm">
                  <div className="w-16 h-16 bg-[#E8F5E9] text-[#2E6F40] rounded-full flex items-center justify-center mb-4">
                    <Icons.Orders />
                  </div>
                  <h3 className="font-bold text-sm text-[#1A2F1C] mb-1">No orders yet</h3>
                  <p className="text-[#6B7A68] text-xs font-semibold max-w-[200px] leading-relaxed">Place an order from your tray, and you'll see preparation status updates here.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  
                  {/* Status Helper Notice */}
                  <div className="bg-[#E8F5E9] border border-[#C8E6C9] text-[#2E6F40] px-4 py-3 rounded-2xl text-[11px] font-semibold leading-relaxed flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E6F40] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2E6F40]"></span>
                    </span>
                    <span>This page listens for kitchen notifications. Keep this open!</span>
                  </div>

                  {tableOrders.map((order, orderIdx) => {
                    const statusConfig = {
                      pending: { text: 'Waiting for kitchen', style: 'border-[#FFE0B2] text-[#B7791F] bg-[#FFFDF5]', dot: 'bg-amber-500' },
                      preparing: { text: 'Chef is cooking', style: 'border-[#C8E6C9] text-[#2E6F40] bg-[#E8F5E9]', dot: 'bg-emerald-600' },
                      served: { text: 'Served & Ready', style: 'border-blue-200 text-blue-800 bg-blue-50', dot: 'bg-blue-600' },
                      cancelled: { text: 'Cancelled', style: 'border-rose-200 text-rose-800 bg-rose-50', dot: 'bg-rose-600' }
                    };

                    const config = statusConfig[order.status] || statusConfig.pending;

                    return (
                      <div key={order._id} className="bg-white rounded-3xl border border-[#E0E6DF] p-4.5 shadow-sm space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-extrabold text-[#8A9B86] uppercase tracking-widest">Order ID</span>
                            <h4 className="font-extrabold text-xs.5 text-[#1A2F1C]">#{order._id.substring(order._id.length - 6).toUpperCase()}</h4>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-[9px] font-semibold text-[#8A9B86]">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${config.style}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`}></span>
                              {config.text}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="border-y border-[#E0E6DF] py-3.5 space-y-2">
                          {order.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex justify-between text-xs leading-normal">
                              <div className="flex-1 font-semibold text-[#1A2F1C]">
                                <span className="text-[#2E6F40] font-black mr-2">{item.quantity}x</span>
                                {item.name}
                                {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                  <div className="text-[9.5px] text-[#6B7A68] font-medium mt-0.5 ml-6">
                                    {item.selectedCustomizations.map(c => c.optionName).join(', ')}
                                  </div>
                                )}
                              </div>
                              <span className="font-extrabold text-[#6B7A68] ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#6B7A68] font-semibold">Total Amount</span>
                          <span className="font-black text-sm text-[#2E6F40]">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Cumulative Session Summary */}
                  {tableOrders.some(o => o.status !== 'cancelled') && (
                    <div className="bg-[#FAF9F5] border border-[#E0E6DF] rounded-3xl p-5 mt-6 text-center space-y-3 shadow-inner">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-[#6B7A68]">Table Session Summary</span>
                      <div className="flex justify-between items-center border-b border-[#E0E6DF] pb-3 text-xs">
                        <span className="font-semibold text-[#6B7A68]">Total Ordered Items</span>
                        <span className="font-extrabold text-[#1A2F1C]">
                          {tableOrders
                            .filter(o => o.status !== 'cancelled')
                            .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[#6B7A68]">Total Bill Due</span>
                        <span className="font-black text-base text-[#1A2F1C]">
                          ${tableOrders
                            .filter(o => o.status !== 'cancelled')
                            .reduce((sum, o) => sum + o.totalAmount, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setWaiterReason('Request Bill');
                          submitCallWaiter();
                        }}
                        className="w-full bg-[#1A2F1C] hover:bg-[#0E1B10] text-white py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider shadow transition-all cursor-pointer mt-2"
                      >
                        Request Bill Checkout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Customization Selection Modal Overlay */}
        {activeCustomizationItem && (
          <div className="absolute inset-0 bg-[#1A2F1C]/45 backdrop-blur-sm flex items-end justify-center z-50 transition-all duration-300">
            <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80%] flex flex-col shadow-2xl border-t border-[#E0E6DF] animate-slide-up">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm.5 font-black text-[#1A2F1C]">{activeCustomizationItem.name}</h3>
                  <p className="text-[11px] text-[#6B7A68] mt-0.5 leading-relaxed font-semibold">{activeCustomizationItem.description}</p>
                </div>
                <button 
                  onClick={() => setActiveCustomizationItem(null)} 
                  className="w-7 h-7 flex items-center justify-center bg-[#FAF9F5] hover:bg-[#E8F5E9] border border-[#E0E6DF] text-[#6B7A68] hover:text-[#2E6F40] rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {activeCustomizationItem.imageUrl && (
                <img 
                  src={activeCustomizationItem.imageUrl} 
                  alt={activeCustomizationItem.name} 
                  className="w-full h-28 object-cover rounded-2xl border border-[#E0E6DF] mb-4 flex-shrink-0" 
                />
              )}

              {/* Scrollable Customizations Group */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1 scrollbar-thin">
                {(activeCustomizationItem.customizationGroups || []).map(group => {
                  const selections = selectedOptions[group.name] || [];
                  return (
                    <div key={group.name} className="bg-[#FAF9F5] border border-[#E0E6DF] rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1A2F1C]">{group.name}</span>
                        {group.required ? (
                          <span className="text-[8.5px] font-extrabold text-[#D32F2F] bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase">Required</span>
                        ) : (
                          <span className="text-[8.5px] font-bold text-[#6B7A68] bg-[#FAF9F5] border border-[#E0E6DF] px-2 py-0.5 rounded uppercase">Optional</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#6B7A68] font-semibold mb-3">
                        {group.maxSelect === 1 ? 'Select 1 option' : `Select up to ${group.maxSelect} options`}
                      </p>
                      
                      <div className="space-y-2">
                        {group.options.map(option => {
                          const isChecked = selections.some(o => o.optionName === option.name);
                          return (
                            <label 
                              key={option.name} 
                              onClick={() => handleOptionToggle(group, option)}
                              className={`flex justify-between items-center py-2.5 px-3.5 border rounded-xl cursor-pointer text-xs transition-colors font-semibold ${
                                isChecked 
                                  ? 'border-[#2E6F40] bg-[#E8F5E9]/50 text-[#2E6F40]' 
                                  : 'border-[#E0E6DF] bg-white text-[#6B7A68] hover:border-[#C8E6C9]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input 
                                  type={group.maxSelect === 1 ? "radio" : "checkbox"} 
                                  name={group.name} 
                                  checked={isChecked}
                                  onChange={() => {}} // Handle dynamically in label onClick
                                  className="accent-[#2E6F40] border-zinc-300 w-4 h-4 cursor-pointer"
                                />
                                <span className={isChecked ? 'text-[#2E6F40]' : 'text-[#1A2F1C]'}>{option.name}</span>
                              </div>
                              {option.price > 0 && (
                                <span className={isChecked ? 'text-[#2E6F40] font-black' : 'text-[#6B7A68]'}>
                                  +${option.price.toFixed(2)}
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Button Action */}
              <div className="pt-4 border-t border-[#E0E6DF] mt-4 flex flex-col gap-2">
                <button 
                  onClick={handleConfirmAdd}
                  disabled={isAddDisabled()}
                  className="w-full bg-[#2E6F40] hover:bg-[#1D4A2A] disabled:bg-zinc-350 text-white text-xs.5 font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-[#2E6F40]/25 cursor-pointer disabled:cursor-not-allowed text-center uppercase tracking-wide"
                >
                  Confirm Addition — ${(activeCustomizationItem.price + getCustomizationPrice()).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Waiter Request Dialog Overlay */}
        {waiterModalOpen && (
          <div className="absolute inset-0 bg-[#1A2F1C]/45 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white w-full max-w-[320px] rounded-3xl p-6 shadow-2xl border border-[#E0E6DF] flex flex-col items-center text-center animate-scale-up">
              
              {waiterRequestStatus === 'selecting' && (
                <div className="space-y-4 w-full">
                  <div className="w-12 h-12 bg-[#E8F5E9] text-[#2E6F40] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Icons.Bell />
                  </div>
                  <h3 className="font-extrabold text-sm.5 text-[#1A2F1C]">Need Assistance?</h3>
                  <p className="text-[#6B7A68] text-xs font-semibold">Choose a reason below to notify your table assistant.</p>
                  
                  <div className="space-y-2">
                    {[
                      'General Assistance',
                      'Request Water / Ice',
                      'Order Assistance',
                      'Clean Table Request',
                      'Request Bill / Invoice'
                    ].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setWaiterReason(reason)}
                        className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all text-left ${
                          waiterReason === reason
                            ? 'border-[#2E6F40] bg-[#E8F5E9]/50 text-[#2E6F40]'
                            : 'border-[#E0E6DF] bg-white text-[#6B7A68] hover:border-[#C8E6C9]'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button 
                      onClick={() => setWaiterModalOpen(false)}
                      className="flex-1 bg-[#FAF9F5] hover:bg-[#E8F5E9] text-[#6B7A68] border border-[#E0E6DF] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={submitCallWaiter}
                      className="flex-1 bg-[#2E6F40] hover:bg-[#1D4A2A] text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Call Staff
                    </button>
                  </div>
                </div>
              )}

              {waiterRequestStatus === 'sending' && (
                <div className="py-8 flex flex-col items-center gap-4">
                  {/* Radar Pulse Effect */}
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-12 h-12 bg-[#2E6F40]/20 rounded-full animate-ping"></div>
                    <div className="absolute w-8 h-8 bg-[#2E6F40]/40 rounded-full animate-pulse"></div>
                    <div className="relative w-6 h-6 bg-[#2E6F40] rounded-full flex items-center justify-center text-white">
                      <Icons.Bell />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm.5 text-[#1A2F1C]">Beaming Signal...</h3>
                    <p className="text-[#6B7A68] text-xs font-semibold">Informing kitchen staff of your request.</p>
                  </div>
                </div>
              )}

              {waiterRequestStatus === 'success' && (
                <div className="py-8 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center animate-bounce">
                    <Icons.Check />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm.5 text-[#1A2F1C]">Staff Notified!</h3>
                    <p className="text-[#6B7A68] text-xs font-semibold max-w-[200px] leading-relaxed">
                      A waiter is attending to your request: <strong className="text-[#2E6F40]">{waiterReason}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Bottom Navigation Bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#E0E6DF] px-4.5 flex justify-between items-center z-40 shrink-0 shadow-lg">
          
          <button 
            onClick={() => setCurrentTab('menu')}
            className={`flex flex-col items-center justify-center gap-1 text-center py-2 flex-1 cursor-pointer transition-all ${
              currentTab === 'menu' ? 'text-[#2E6F40] scale-105 font-bold' : 'text-[#6B7A68] hover:text-[#2E6F40]'
            }`}
          >
            <Icons.Menu />
            <span className="text-[9.5px]">Menu</span>
          </button>

          <button 
            onClick={() => setCurrentTab('cart')}
            className={`flex flex-col items-center justify-center gap-1 text-center py-2 flex-1 cursor-pointer relative transition-all ${
              currentTab === 'cart' ? 'text-[#2E6F40] scale-105 font-bold' : 'text-[#6B7A68] hover:text-[#2E6F40]'
            }`}
          >
            <div className="relative">
              <Icons.Cart />
              {cartTotalQty > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D32F2F] text-white border border-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-black animate-pulse">
                  {cartTotalQty}
                </span>
              )}
            </div>
            <span className="text-[9.5px]">My Tray</span>
          </button>

          <button 
            onClick={() => setCurrentTab('orders')}
            className={`flex flex-col items-center justify-center gap-1 text-center py-2 flex-1 cursor-pointer relative transition-all ${
              currentTab === 'orders' ? 'text-[#2E6F40] scale-105 font-bold' : 'text-[#6B7A68] hover:text-[#2E6F40]'
            }`}
          >
            <div className="relative">
              <Icons.Orders />
              {tableOrders.some(o => o.status === 'pending' || o.status === 'preparing') && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#2E6F40] border border-white rounded-full animate-ping"></span>
              )}
            </div>
            <span className="text-[9.5px]">Kitchen Status</span>
          </button>

          <button 
            onClick={handleCallWaiter}
            className="flex flex-col items-center justify-center gap-1 text-center py-2 flex-1 cursor-pointer text-[#6B7A68] hover:text-[#2E6F40] transition-all"
          >
            <Icons.Bell />
            <span className="text-[9.5px]">Call Waiter</span>
          </button>
        </nav>

      </div>

      {/* Embedded slide animations & scroll utilities */}
      <style jsx global>{`
        /* Hide scrollbars but keep functionality */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 3.5px;
          height: 3.5px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #E0E6DF;
          border-radius: 10px;
        }
        
        /* Keyframe slide-up animation */
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        /* Scale-up animation */
        @keyframes scale-up {
          from {
            transform: scale(0.92);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-up {
          animation: scale-up 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
