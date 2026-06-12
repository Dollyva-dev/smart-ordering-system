export interface CustomizationOption {
  name: string;
  price: number;
}

export interface CustomizationGroup {
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface MenuItem {
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

export interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  selectedCustomizations?: SelectedCustomizationOption[];
}

export interface SelectedCustomizationOption {
  groupName: string;
  optionName: string;
  price: number;
}

export interface Order {
  _id: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  createdAt: string;
}
