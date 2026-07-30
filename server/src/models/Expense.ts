import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseType = 'OPERATING' | 'MAINTENANCE' | 'UTILITY' | 'OTHER';

export interface IExpense extends Document {
  station?: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId;
  type: ExpenseType;
  description: string;
  amount: number;
  paid: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema<IExpense> = new Schema(
  {
    station: { type: Schema.Types.ObjectId, ref: 'Station' },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    type: {
      type: String,
      enum: ['OPERATING', 'MAINTENANCE', 'UTILITY', 'OTHER'],
      default: 'OPERATING',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Expense description is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    paid: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
