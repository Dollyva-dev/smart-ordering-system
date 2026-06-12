import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomizationOption {
  name: string;
  price: number;
}

export interface ICustomizationGroup {
  name: string;
  required: boolean;
  minSelect: number;
  maxSelect: number;
  options: ICustomizationOption[];
}

export interface IMenuItem extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  customizationGroups: ICustomizationGroup[];
  isFeatured: boolean;
  featuredPosition?: number;
  featuredBadge?: string;
  discountPercent?: number;
  dietaryPreferences?: string[];
}

const CustomizationOptionSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 }
});

const CustomizationGroupSchema = new Schema({
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  minSelect: { type: Number, default: 0 },
  maxSelect: { type: Number, default: 1 },
  options: [CustomizationOptionSchema]
});

const MenuItemSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: false },
    isAvailable: { type: Boolean, default: true },
    customizationGroups: { type: [CustomizationGroupSchema], default: [] },
    isFeatured: { type: Boolean, default: false },
    featuredPosition: { type: Number, default: null },
    featuredBadge: { type: String, default: null },
    discountPercent: { type: Number, default: 0 },
    dietaryPreferences: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

