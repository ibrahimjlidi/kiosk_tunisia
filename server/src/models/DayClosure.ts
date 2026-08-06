import mongoose, { Schema, Document } from 'mongoose';

export type DayClosureStatus = 'OPEN' | 'LOCKED';

export interface IDayClosure extends Document {
  station: mongoose.Types.ObjectId;
  closureDate: Date;
  status: DayClosureStatus;
  closedBy?: mongoose.Types.ObjectId;
  reopenedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DayClosureSchema: Schema<IDayClosure> = new Schema(
  {
    station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    closureDate: { type: Date, required: true },
    status: { type: String, enum: ['OPEN', 'LOCKED'], default: 'OPEN' },
    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reopenedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

DayClosureSchema.index({ station: 1, closureDate: 1 }, { unique: true });

export const DayClosure = mongoose.model<IDayClosure>('DayClosure', DayClosureSchema);
