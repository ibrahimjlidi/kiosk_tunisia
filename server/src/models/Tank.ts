import mongoose, { Schema, Document } from 'mongoose';

export interface ITank extends Document {
  station: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  tankNumber: string;
  capacity: number;       // Max capacity in liters (e.g. 20000)
  currentStock: number;   // Current physical/theoretical stock in liters
  minLevelAlert: number;  // Minimum threshold alert in liters
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TankSchema: Schema<ITank> = new Schema(
  {
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Fuel product reference is required'],
    },
    tankNumber: {
      type: String,
      required: [true, 'Tank number/name is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Tank capacity is required'],
      min: [100, 'Tank capacity must be at least 100 liters'],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minLevelAlert: {
      type: Number,
      default: 2000,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Tank = mongoose.model<ITank>('Tank', TankSchema);
