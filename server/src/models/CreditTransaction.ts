import mongoose, { Schema, Document } from 'mongoose';

export type CreditType = 'SALE' | 'PAYMENT' | 'ADJUSTMENT';

export interface ICreditTransaction extends Document {
  customer: mongoose.Types.ObjectId;
  station?: mongoose.Types.ObjectId;
  type: CreditType;
  referenceId?: mongoose.Types.ObjectId; // e.g. Sale id
  amount: number; // positive for charges, negative for payments
  notes?: string;
  createdAt: Date;
}

const CreditTransactionSchema: Schema<ICreditTransaction> = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    station: { type: Schema.Types.ObjectId, ref: 'Station' },
    type: { type: String, enum: ['SALE','PAYMENT','ADJUSTMENT'], required: true },
    referenceId: { type: Schema.Types.ObjectId },
    amount: { type: Number, required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CreditTransaction = mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
