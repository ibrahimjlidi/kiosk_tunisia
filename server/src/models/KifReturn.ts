import mongoose, { Schema, Document } from 'mongoose';

export interface IKifReturn extends Document {
  station: mongoose.Types.ObjectId;
  shift?: mongoose.Types.ObjectId;
  date: Date;
  product?: mongoose.Types.ObjectId;
  quantity: number;
  reason: string;
  notes?: string;
  operator: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const KifReturnSchema: Schema<IKifReturn> = new Schema(
  {
    station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    shift: { type: Schema.Types.ObjectId, ref: 'Shift' },
    date: { type: Date, default: Date.now },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    operator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const KifReturn = mongoose.model<IKifReturn>('KifReturn', KifReturnSchema);
