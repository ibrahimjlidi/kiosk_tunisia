import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'CASH' | 'BANK_CARD' | 'FUEL_CARD' | 'BANK_TRANSFER' | 'CREDIT';

export interface ISale extends Document {
  station: mongoose.Types.ObjectId;
  shift?: mongoose.Types.ObjectId;
  pump?: mongoose.Types.ObjectId;
  pistol?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  productName: string;
  productCode: string;
  employee?: mongoose.Types.ObjectId;
  quantity: number; // liters or units
  purchasePrice: number;
  sellingPrice: number;
  vatRate: number;
  amountHT: number;
  vatAmount: number;
  amountTTC: number;
  profit: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
}

const SaleSchema: Schema<ISale> = new Schema(
  {
    station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    shift:   { type: Schema.Types.ObjectId, ref: 'Shift' },
    pump:    { type: Schema.Types.ObjectId, ref: 'Pump' },
    pistol:  { type: Schema.Types.ObjectId, ref: 'Pistol' },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    productName: { type: String, required: true },
    productCode: { type: String, required: true },
    employee: { type: Schema.Types.ObjectId, ref: 'User' },
    quantity: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice:  { type: Number, required: true, min: 0 },
    vatRate: { type: Number, default: 19 },
    amountHT: { type: Number, required: true },
    vatAmount: { type: Number, required: true },
    amountTTC: { type: Number, required: true },
    profit: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CASH','BANK_CARD','FUEL_CARD','BANK_TRANSFER','CREDIT'], default: 'CASH' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Sale = mongoose.model<ISale>('Sale', SaleSchema);
