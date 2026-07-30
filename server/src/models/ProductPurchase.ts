import mongoose, { Schema, Document } from 'mongoose';

export interface IProductPurchase extends Document {
  product: mongoose.Types.ObjectId;
  station?: mongoose.Types.ObjectId;
  supplier?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
  createdAt: Date;
}

const ProductPurchaseSchema: Schema<IProductPurchase> = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    station: { type: Schema.Types.ObjectId, ref: 'Station' },
    supplier: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ProductPurchase = mongoose.model<IProductPurchase>('ProductPurchase', ProductPurchaseSchema);
