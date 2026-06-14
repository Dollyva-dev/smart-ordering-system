"use client";

import { useEffect, useState, use, useRef } from 'react';
import { useCartStore, SelectedCustomizationOption } from '@/store/cartStore';
import { io, Socket } from 'socket.io-client';

import { MenuItem, Order, CustomizationGroup, CustomizationOption, Promotion } from '@/types/restaurant';
import { Header } from '@/components/customer/Header';
import { CategoryPills } from '@/components/customer/CategoryPills';
import { MenuTab } from '@/components/customer/MenuTab';
import { CartTab } from '@/components/customer/CartTab';
import { OrdersTab } from '@/components/customer/OrdersTab';
import { ProductView } from '@/components/customer/ProductView';
import { PromoView } from '@/components/customer/PromoView';
import { WaiterModal } from '@/components/customer/WaiterModal';
import { BottomNav } from '@/components/customer/BottomNav';

const BACKEND_URL = 'http://localhost:5000';

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

export default function TableMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [orderStatus, setOrderStatus] = useState<'success' | 'error' | 'submitting' | null>(null);
  
  // Product View state
  const [activeProductItem, setActiveProductItem] = useState<MenuItem | null>(null);
  const [activePromo, setActivePromo] = useState<Promotion | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [groupName: string]: SelectedCustomizationOption[] }>({});

  // Navigation and Filter state
  const [currentTab, setCurrentTab] = useState<'menu' | 'cart' | 'orders'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  
  const [sortBy, setSortBy] = useState<string>('Recommended');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([]);

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

  useEffect(() => {
    // 1. Fetch menu
    fetch(`${BACKEND_URL}/api/menu`)
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data);
        if (data.length > 0) {
          const sortedCats = [
            ...RESTAURANT_CATEGORIES.filter(cat => data.some((item: MenuItem) => item.category === cat)),
            ...Array.from(new Set(data.map((item: MenuItem) => item.category))).filter((cat: any) => !RESTAURANT_CATEGORIES.includes(cat))
          ] as string[];
          if (sortedCats.length > 0) {
            // We keep it as 'All' by default instead of forcing the first category
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching menu:', err);
        setLoading(false);
      });

    // Fetch promotions
    fetch(`${BACKEND_URL}/api/promotions`)
      .then((res) => res.json())
      .then((data) => setPromotions(data))
      .catch((err) => console.error('Error fetching promotions:', err));

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
        
        const updatedOrdersRes = await fetch(`${BACKEND_URL}/api/orders?tableNumber=${tableId}`);
        const updatedOrdersData = await updatedOrdersRes.json();
        setTableOrders(updatedOrdersData);

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

  const handleOpenProduct = (item: MenuItem) => {
    setActiveProductItem(item);
    const initial: { [groupName: string]: SelectedCustomizationOption[] } = {};
    if (item.customizationGroups) {
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
    }
    setSelectedOptions(initial);
  };

  const handleAddClick = (item: MenuItem) => {
    // We retain this for the quick "+" button if they want to fast-add
    if (item.customizationGroups && item.customizationGroups.length > 0) {
      handleOpenProduct(item);
    } else {
      addItem({
        _id: item._id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
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
    if (!activeProductItem) return true;
    for (const group of activeProductItem.customizationGroups || []) {
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
    if (!activeProductItem || isAddDisabled()) return;

    const flatCustomizations: SelectedCustomizationOption[] = [];
    Object.values(selectedOptions).forEach(list => {
      flatCustomizations.push(...list);
    });

    const discount = activeProductItem.discountPercent || 0;
    const finalPrice = discount > 0 ? activeProductItem.price * (1 - discount / 100) : activeProductItem.price;

    addItem({
      _id: activeProductItem._id,
      name: activeProductItem.name,
      price: finalPrice,
      imageUrl: activeProductItem.imageUrl,
      selectedCustomizations: flatCustomizations
    });

    setActiveProductItem(null);
  };

  const selectCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    const pillElement = document.getElementById(`pill-${categoryName}`);
    if (pillElement && categoriesRef.current) {
      const container = categoriesRef.current;
      const scrollLeft = pillElement.offsetLeft - container.offsetWidth / 2 + pillElement.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const getCartItemQuantity = (itemId: string) => {
    return items.filter(i => i._id === itemId).reduce((sum, i) => sum + i.quantity, 0);
  };

  const getSingleCartItem = (itemId: string) => {
    const match = items.filter(i => i._id === itemId);
    return match.length === 1 ? match[0] : null;
  };

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

  const activeMenuCategories = [
    ...RESTAURANT_CATEGORIES.filter(cat => menuItems.some(item => item.category === cat)),
    ...Array.from(new Set(menuItems.map(item => item.category))).filter((cat: any) => !RESTAURANT_CATEGORIES.includes(cat))
  ];

  const cartTotalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let displayItems = searchQuery 
    ? filteredMenuItems 
    : (activeCategory && activeCategory !== 'All' ? menuItems.filter(item => item.category === activeCategory) : [...menuItems]);

  // Apply Price Filter
  if (priceRange === 'Under $10') displayItems = displayItems.filter(i => (i.discountPercent ? i.price * (1 - i.discountPercent/100) : i.price) < 10);
  if (priceRange === '$10 - $20') displayItems = displayItems.filter(i => {
    const p = i.discountPercent ? i.price * (1 - i.discountPercent/100) : i.price;
    return p >= 10 && p <= 20;
  });
  if (priceRange === 'Over $20') displayItems = displayItems.filter(i => (i.discountPercent ? i.price * (1 - i.discountPercent/100) : i.price) > 20);

  // Apply Dietary Filter
  if (dietaryFilter.length > 0) {
    displayItems = displayItems.filter(i => dietaryFilter.every(df => i.dietaryPreferences?.includes(df)));
  }

  // Apply Sorting
  if (sortBy === 'Price: Low to High') {
    displayItems.sort((a, b) => (a.discountPercent ? a.price * (1 - a.discountPercent/100) : a.price) - (b.discountPercent ? b.price * (1 - b.discountPercent/100) : b.price));
  } else if (sortBy === 'Price: High to Low') {
    displayItems.sort((a, b) => (b.discountPercent ? b.price * (1 - b.discountPercent/100) : b.price) - (a.discountPercent ? a.price * (1 - a.discountPercent/100) : a.price));
  } else if (sortBy === 'Popular') {
    displayItems.sort((a, b) => (b.featuredBadge === 'Popular' ? 1 : 0) - (a.featuredBadge === 'Popular' ? 1 : 0));
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#FAF9F5]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#2E6F40]/20 border-t-[#2E6F40] rounded-full animate-spin"></div>
        <div className="text-xs font-bold text-[#2E6F40] uppercase tracking-widest animate-pulse">Loading Gourmet Menu...</div>
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] bg-[#FAF9F5] md:bg-zinc-100 flex justify-center py-0 md:py-6 antialiased">
      <div className="w-full max-w-md bg-[#FAF9F5] h-full md:min-h-[85vh] md:max-h-[92vh] md:rounded-3xl md:shadow-2xl flex flex-col relative overflow-hidden border-0 md:border-[10px] md:border-zinc-800">
        
        <Header 
          tableId={tableId}
          waiterCalled={waiterCalled}
          cancelWaiter={cancelWaiter}
          handleCallWaiter={handleCallWaiter}
        />

        <main className="flex-1 overflow-y-auto pb-24 scrollbar-thin">
          {currentTab === 'menu' && (
            <MenuTab 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              displayItems={displayItems}
              featuredItems={[...menuItems.filter(i => i.isFeatured), ...promotions.filter(p => p.isFeatured)]}
              getCartItemQuantity={getCartItemQuantity}
              getSingleCartItem={getSingleCartItem}
              handleAddClick={handleAddClick}
              handleOpenProduct={handleOpenProduct}
              handleOpenPromo={(promo) => setActivePromo(promo)}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              // Pass category stuff down to MenuTab
              categories={activeMenuCategories}
              selectCategory={selectCategory}
              categoriesRef={categoriesRef}
              // Pass filters down
              sortBy={sortBy}
              setSortBy={setSortBy}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              dietaryFilter={dietaryFilter}
              setDietaryFilter={setDietaryFilter}
            />
          )}

          {currentTab === 'cart' && (
            <CartTab 
              items={items}
              cartTotalQty={cartTotalQty}
              orderStatus={orderStatus}
              orderNotes={orderNotes}
              setOrderNotes={setOrderNotes}
              getTotal={getTotal}
              handlePlaceOrder={handlePlaceOrder}
              setCurrentTab={setCurrentTab}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersTab 
              tableOrders={tableOrders}
              setWaiterReason={setWaiterReason}
              submitCallWaiter={submitCallWaiter}
            />
          )}
        </main>

        {activeProductItem && (
          <ProductView
            item={activeProductItem}
            onClose={() => setActiveProductItem(null)}
            selectedOptions={selectedOptions}
            handleOptionToggle={handleOptionToggle}
            isAddDisabled={isAddDisabled}
            handleConfirmAdd={handleConfirmAdd}
            getCustomizationPrice={getCustomizationPrice}
          />
        )}

        {activePromo && (
          <PromoView
            promo={activePromo}
            onClose={() => setActivePromo(null)}
            menuItems={menuItems}
          />
        )}

        {waiterModalOpen && (
          <WaiterModal 
            waiterRequestStatus={waiterRequestStatus}
            waiterReason={waiterReason}
            setWaiterReason={setWaiterReason}
            setWaiterModalOpen={setWaiterModalOpen}
            submitCallWaiter={submitCallWaiter}
          />
        )}

        <BottomNav 
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          cartTotalQty={cartTotalQty}
          tableOrders={tableOrders}
          handleCallWaiter={handleCallWaiter}
        />

      </div>

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
