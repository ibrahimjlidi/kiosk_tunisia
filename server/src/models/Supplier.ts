import mongoose, { Schema, Document } from 'mongoose';

const generateSupplierCode = (): string => {
  const stamp = Date.now().toString().slice(-6);
  return `SUP-${stamp}`;
};

export interface ISupplier extends Document {
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
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
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      default: () => `SUP-${Date.now().toString().slice(-6)}`,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    address: {
      type: String,
      trim: true,
    },
    taxId: {
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

SupplierSchema.pre('validate', function (next) {
  if (!this.code) {
    this.code = generateSupplierCode();
  }
  next();
});

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
