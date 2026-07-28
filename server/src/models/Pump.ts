import mongoose, { Schema, Document } from 'mongoose';

export interface IPistol {
  _id?: mongoose.Types.ObjectId;
  pistolNumber: number;
  product: mongoose.Types.ObjectId;
  currentClosingIndex: number;
  active: boolean;
}

export interface IPump extends Document {
  station: mongoose.Types.ObjectId;
  pumpNumber: string;
  pistols: IPistol[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PistolSchema: Schema<IPistol> = new Schema({
  pistolNumber: {
    type: Number,
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  currentClosingIndex: {
    type: Number,
    default: 0,
    min: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const PumpSchema: Schema<IPump> = new Schema(
  {
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required'],
    },
    pumpNumber: {
      type: String,
      required: [true, 'Pump number/name is required'],
      trim: true,
    },
    pistols: [PistolSchema],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Pump = mongoose.model<IPump>('Pump', PumpSchema);
