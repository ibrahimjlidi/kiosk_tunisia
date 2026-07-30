import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  creditBalance: number; // positive = owes money
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema<ICustomer> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    creditBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
