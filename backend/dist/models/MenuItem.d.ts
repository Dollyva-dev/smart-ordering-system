import mongoose, { Document } from 'mongoose';
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
}
declare const _default: mongoose.Model<IMenuItem, {}, {}, {}, mongoose.Document<unknown, {}, IMenuItem, {}, mongoose.DefaultSchemaOptions> & IMenuItem & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMenuItem>;
export default _default;
//# sourceMappingURL=MenuItem.d.ts.map