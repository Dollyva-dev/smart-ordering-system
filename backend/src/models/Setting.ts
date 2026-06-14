import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  taxPercentage: number;
  serviceChargePercentage: number;
}

const SettingSchema = new Schema<ISetting>(
  {
    taxPercentage: { 
      type: Number, 
      default: 0 
    },
    serviceChargePercentage: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

export default mongoose.model<ISetting>('Setting', SettingSchema);
