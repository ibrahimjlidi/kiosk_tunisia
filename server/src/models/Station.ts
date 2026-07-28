import mongoose, { Schema, Document } from 'mongoose';

export interface IStation extends Document {
  name: string;
  code: string;
  address: string;
  city: string;
  phone: string;
  taxId: string; // Matricule Fiscal (Tunisia)
  manager?: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StationSchema: Schema<IStation> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Station code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    city: {
      type: String,
      default: 'Tunis',
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

export const Station = mongoose.model<IStation>('Station', StationSchema);
