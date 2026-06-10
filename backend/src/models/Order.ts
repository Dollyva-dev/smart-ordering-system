import mongoose, { Document, Schema } from 'mongoose';

export interface ISelectedCustomization {
  groupName: string;
  optionName: string;
  price: number;
}

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  selectedCustomizations?: ISelectedCustomization[];
}

export interface IOrder extends Document {
  tableNumber: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
}

const SelectedCustomizationSchema = new Schema({
  groupName: { type: String, required: true },
  optionName: { type: String, required: true },
  price: { type: Number, required: true, default: 0 }
});

const OrderItemSchema: Schema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedCustomizations: { type: [SelectedCustomizationSchema], default: [] }
});


const OrderSchema: Schema = new Schema(
  {
    tableNumber: { type: String, required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'served', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
