import mongoose, { Schema, Document } from 'mongoose';

export type ProductCategory = 'FUEL' | 'KIOSK' | 'SERVICE';
export type UnitOfMeasure = 'LITER' | 'UNIT' | 'SERVICE';

export interface IProduct extends Document {
  name: string;
  code: string;
  category: ProductCategory;
  purchasePrice: number; // TND HT or TTC base
  sellingPrice: number;  // TND TTC
  vatRate: number;       // % (e.g. 19 for 19%)
  unitOfMeasure: UnitOfMeasure;
  minStockAlert: number;
  currentStock: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['FUEL', 'KIOSK', 'SERVICE'],
      default: 'FUEL',
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    vatRate: {
      type: Number,
      default: 19, // Standard Tunisian VAT rate (19%)
      min: 0,
      max: 100,
    },
    unitOfMeasure: {
      type: String,
      enum: ['LITER', 'UNIT', 'SERVICE'],
      default: 'LITER',
    },
    minStockAlert: {
      type: Number,
      default: 1000,
    },
    currentStock: {
      type: Number,
      default: 0,
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

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
