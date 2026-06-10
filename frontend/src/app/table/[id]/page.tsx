"use client";

import { useEffect, useState, use } from 'react';
import { useCartStore, SelectedCustomizationOption } from '@/store/cartStore';

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

export default function TableMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  
  // Customization modal state
  const [activeCustomizationItem, setActiveCustomizationItem] = useState<MenuItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [groupName: string]: SelectedCustomizationOption[] }>({});

  // Unwrap params
  const { id: tableId } = use(params);

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching menu:', err);
        setLoading(false);
      });
  }, []);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    
    setOrderStatus('submitting');
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
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
        setTimeout(() => setOrderStatus(null), 5000);
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
      // Initialize selected options with empty arrays or defaults
      const initial: { [groupName: string]: SelectedCustomizationOption[] } = {};
      item.customizationGroups.forEach(g => {
        if (g.required && g.maxSelect === 1 && g.options.length > 0) {
          // Auto select first option for required single-selects
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
      // Single select (radio behavior)
      if (isChecked && !group.required) {
        setSelectedOptions(prev => ({ ...prev, [group.name]: [] }));
      } else {
        setSelectedOptions(prev => ({
          ...prev,
          [group.name]: [{ groupName: group.name, optionName: option.name, price: option.price }]
        }));
      }
    } else {
      // Multi select (checkbox behavior)
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
    // Check if all required groups have minimum selection satisfied
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

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-zinc-50">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Menu...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <h1 className="text-base font-bold text-zinc-900">Table {tableId}</h1>
          <div className="border border-zinc-200 bg-zinc-50 text-zinc-500 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
            {items.reduce((acc, i) => acc + i.quantity, 0)} items in cart
          </div>
        </div>
      </header>

      {/* Menu Sections */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {orderStatus === 'success' && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md font-semibold text-center text-sm shadow-sm">
            🎉 Order placed successfully! The kitchen is preparing it.
          </div>
        )}

        {orderStatus === 'error' && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md font-semibold text-center text-sm shadow-sm">
            ⚠️ Failed to place order. Please check with staff.
          </div>
        )}
        
        {categories.map(category => (
          <div key={category} className="mb-8">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 pb-1.5 border-b border-zinc-200">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.filter(item => item.category === category).map(item => (
                <div key={item._id} className="bg-white rounded-md p-4 border border-zinc-200 hover:border-zinc-300 transition-all flex justify-between gap-4 group">
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-zinc-800 transition-colors group-hover:text-zinc-900 mb-1">{item.name}</h3>
                      <p className="text-zinc-550 text-xs line-clamp-2 leading-relaxed mb-3">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-900">${item.price.toFixed(2)}</span>
                      {item.customizationGroups && item.customizationGroups.length > 0 && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-50 border border-zinc-200 px-1 rounded-sm">Customizable</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md border border-zinc-150" />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-zinc-50 border border-dashed border-zinc-200 rounded-md flex items-center justify-center text-[10px] text-zinc-400">No Image</div>
                    )}
                    <button 
                      onClick={() => handleAddClick(item)}
                      disabled={!item.isAvailable}
                      className={`w-full py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        item.isAvailable 
                          ? 'bg-zinc-900 text-white hover:bg-zinc-850 active:scale-[0.98]' 
                          : 'border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      {item.isAvailable ? 'Add' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Customization Modal */}
      {activeCustomizationItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md border border-zinc-200 rounded-md p-6 max-h-[85vh] flex flex-col shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-base font-bold text-zinc-900">{activeCustomizationItem.name}</h2>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{activeCustomizationItem.description}</p>
              </div>
              <button 
                onClick={() => setActiveCustomizationItem(null)} 
                className="text-zinc-400 hover:text-zinc-900 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {activeCustomizationItem.imageUrl && (
              <img 
                src={activeCustomizationItem.imageUrl} 
                alt={activeCustomizationItem.name} 
                className="w-full h-36 object-cover rounded-md border border-zinc-150 mb-4 flex-shrink-0" 
              />
            )}

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 py-1">
              {(activeCustomizationItem.customizationGroups || []).map(group => {
                const selections = selectedOptions[group.name] || [];
                return (
                  <div key={group.name} className="border-t border-zinc-100 pt-4 first:border-0 first:pt-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">{group.name}</span>
                      {group.required ? (
                        <span className="text-[9px] font-bold text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded-sm">Required</span>
                      ) : (
                        <span className="text-[9px] font-medium text-zinc-450 uppercase bg-zinc-50 px-1.5 py-0.5 rounded-sm">Optional</span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 mb-3">
                      {group.maxSelect === 1 ? 'Select 1 option' : `Select up to ${group.maxSelect} options`}
                    </p>
                    <div className="space-y-2">
                      {group.options.map(option => {
                        const isChecked = selections.some(o => o.optionName === option.name);
                        return (
                          <label 
                            key={option.name} 
                            onClick={() => handleOptionToggle(group, option)}
                            className="flex justify-between items-center py-2 px-3 border border-zinc-150 hover:border-zinc-300 rounded-md cursor-pointer text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <input 
                                type={group.maxSelect === 1 ? "radio" : "checkbox"} 
                                name={group.name} 
                                checked={isChecked}
                                onChange={() => {}} // Handle dynamically in label onClick
                                className="accent-zinc-900 border-zinc-300 w-3.5 h-3.5"
                              />
                              <span className="text-zinc-800 font-medium">{option.name}</span>
                            </div>
                            {option.price > 0 && (
                              <span className="text-zinc-500 font-semibold">+${option.price.toFixed(2)}</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-zinc-100 mt-4 flex flex-col gap-2">
              <button 
                onClick={handleConfirmAdd}
                disabled={isAddDisabled()}
                className="w-full bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold py-2.5 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                Add to Order — ${(activeCustomizationItem.price + getCustomizationPrice()).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Cart Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-3 max-h-48 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.cartId} className="flex justify-between items-center py-2.5 border-b border-zinc-100 last:border-0">
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-semibold text-zinc-850">{item.name}</p>
                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed font-medium">
                        {item.selectedCustomizations.map(c => `${c.optionName} (+$${c.price})`).join(', ')}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-400 mt-1">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md p-0.5">
                    <button 
                      onClick={() => item.quantity > 1 ? updateQuantity(item.cartId, item.quantity - 1) : removeItem(item.cartId)} 
                      className="w-6 h-6 flex items-center justify-center bg-white rounded border border-zinc-150 text-zinc-650 hover:bg-zinc-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-semibold text-xs w-5 text-center text-zinc-850">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)} 
                      className="w-6 h-6 flex items-center justify-center bg-white rounded border border-zinc-150 text-zinc-650 hover:bg-zinc-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Total Amount</p>
                <p className="text-lg font-bold text-zinc-900">${getTotal().toFixed(2)}</p>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={orderStatus === 'submitting'}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-md font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                {orderStatus === 'submitting' ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


