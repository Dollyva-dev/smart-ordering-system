import mongoose, { Document } from 'mongoose';
export interface IAdmin extends Document {
    username: string;
    passwordHash: string;
}
declare const _default: mongoose.Model<IAdmin, {}, {}, {}, mongoose.Document<unknown, {}, IAdmin, {}, mongoose.DefaultSchemaOptions> & IAdmin & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAdmin>;
export default _default;
//# sourceMappingURL=Admin.d.ts.map