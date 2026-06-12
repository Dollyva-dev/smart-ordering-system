import mongoose, { Document, Schema } from 'mongoose';

export interface IFloorElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  seats: number;
  isTable: boolean;
}

export interface IFloorPlan extends Document {
  name: string;
  elements: IFloorElement[];
}

const FloorElementSchema = new Schema<IFloorElement>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  label: { type: String, default: '' },
  seats: { type: Number, default: 0 },
  isTable: { type: Boolean, default: false }
}, { _id: false });

const FloorPlanSchema = new Schema<IFloorPlan>({
  name: { type: String, required: true },
  elements: [FloorElementSchema]
}, { timestamps: true });

export default mongoose.model<IFloorPlan>('FloorPlan', FloorPlanSchema);
