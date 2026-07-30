import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema<ISupplier> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
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

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
