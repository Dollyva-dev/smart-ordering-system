import { create } from 'zustand';

export interface SelectedCustomizationOption {
  groupName: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartId: string; // Composite key: MenuItemId + customizations JSON
  _id: string; // MenuItem ID
  name: string;
  price: number; // Total price (basePrice + sum of customizations)
  basePrice: number;
  quantity: number;
  selectedCustomizations: SelectedCustomizationOption[];
}

interface CartStore {
  items: CartItem[];
  addItem: (item: { 
    _id: string; 
    name: string; 
    price: number; 
    selectedCustomizations?: SelectedCustomizationOption[] 
  }) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (newItem) => {
    set((state) => {
      const customizations = newItem.selectedCustomizations || [];
      // Sort customizations by group/option to ensure unique, stable compound keys
      const sortedCustomizations = [...customizations].sort((a, b) => 
        a.groupName.localeCompare(b.groupName) || a.optionName.localeCompare(b.optionName)
      );
      const cartId = `${newItem._id}-${JSON.stringify(sortedCustomizations)}`;
      const extraPrice = sortedCustomizations.reduce((sum, opt) => sum + opt.price, 0);
      const finalPrice = newItem.price + extraPrice;

      const existingItem = state.items.find((i) => i.cartId === cartId);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { 
        items: [
          ...state.items, 
          { 
            cartId, 
            _id: newItem._id, 
            name: newItem.name, 
            price: finalPrice, 
            basePrice: newItem.price, 
            quantity: 1, 
            selectedCustomizations: sortedCustomizations 
          }
        ] 
      };
    });
  },
  removeItem: (cartId) => {
    set((state) => ({
      items: state.items.filter((i) => i.cartId !== cartId),
    }));
  },
  updateQuantity: (cartId, quantity) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.cartId === cartId ? { ...i, quantity: Math.max(1, quantity) } : i
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    const state = get();
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));

