import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
  tableNumber: string;
  qrCodeUrl: string;
}

const TableSchema: Schema = new Schema(
  {
    tableNumber: { type: String, required: true, unique: true },
    qrCodeUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITable>('Table', TableSchema);
