import mongoose, { Document, Schema } from 'mongoose';

export interface IPromotion extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  promoType: 'discount' | 'bogo' | 'combo' | 'spend_more';
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderValue: number;
  applicableItemIds: mongoose.Types.ObjectId[];
  requiredItemIds: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  isFeatured: boolean;
  featuredPosition?: number;
  featuredBadge?: string;
}

const PromotionSchema = new Schema<IPromotion>({
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    promoType: { 
      type: String, 
      enum: ['discount', 'bogo', 'combo', 'spend_more'], 
      required: true,
      default: 'discount'
    },
    discountType: { 
      type: String, 
      enum: ['PERCENTAGE', 'FLAT'], 
      required: true,
      default: 'PERCENTAGE'
    },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    applicableItemIds: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
    requiredItemIds: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    featuredPosition: { type: Number },
    featuredBadge: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IPromotion>('Promotion', PromotionSchema);
