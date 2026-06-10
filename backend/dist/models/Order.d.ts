import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
export default _default;
//# sourceMappingURL=Order.d.ts.map