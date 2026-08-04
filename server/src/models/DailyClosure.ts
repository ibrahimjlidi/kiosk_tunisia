import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyClosure extends Document {
  station: mongoose.Types.ObjectId;
  closureDate: Date;
  status: 'OPEN' | 'CLOSED';
  salesTTC: number;
  totalPayments: number;
  totalExpenses: number;
  totalPurchases: number;
  totalKifQuantity: number;
  variance: number;
  isBalanced: boolean;
  notes?: string;
  closedBy?: mongoose.Types.ObjectId;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DailyClosureSchema: Schema<IDailyClosure> = new Schema(
  {
    station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    closureDate: { type: Date, required: true },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    salesTTC: { type: Number, default: 0 },
    totalPayments: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalKifQuantity: { type: Number, default: 0 },
    variance: { type: Number, default: 0 },
    isBalanced: { type: Boolean, default: false },
    notes: { type: String, trim: true },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

DailyClosureSchema.index({ station: 1, closureDate: 1 }, { unique: true });

export const DailyClosure = mongoose.model<IDailyClosure>('DailyClosure', DailyClosureSchema);
