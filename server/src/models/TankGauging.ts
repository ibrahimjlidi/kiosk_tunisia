import mongoose, { Schema, Document } from 'mongoose';

export interface ITankGauging extends Document {
  tank: mongoose.Types.ObjectId;
  station: mongoose.Types.ObjectId;
  gaugedAt: Date;
  dipReading: number;          // mm (millimeters)
  calculatedVolume: number;    // liters (from dip-to-volume conversion)
  waterLevel: number;          // mm (water bottom)
  temperature: number;         // Celsius
  theoreticalStock: number;    // currentStock from Tank model at time of gauging
  variance: number;            // calculatedVolume - theoreticalStock
  operator: mongoose.Types.ObjectId;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const TankGaugingSchema: Schema<ITankGauging> = new Schema(
  {
    tank: {
      type: Schema.Types.ObjectId,
      ref: 'Tank',
      required: [true, 'Tank reference is required'],
    },
    station: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: [true, 'Station reference is required'],
    },
    gaugedAt: {
      type: Date,
      default: Date.now,
    },
    dipReading: {
      type: Number,
      required: [true, 'Dip reading (mm) is required'],
      min: [0, 'Dip reading cannot be negative'],
    },
    calculatedVolume: {
      type: Number,
      required: [true, 'Calculated volume is required'],
      min: [0, 'Calculated volume cannot be negative'],
    },
    waterLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    temperature: {
      type: Number,
      default: 20,
    },
    theoreticalStock: {
      type: Number,
      default: 0,
    },
    variance: {
      type: Number,
      default: 0,
    },
    operator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Index for efficient queries
TankGaugingSchema.index({ tank: 1, gaugedAt: -1 });
TankGaugingSchema.index({ station: 1, gaugedAt: -1 });

export const TankGauging = mongoose.model<ITankGauging>('TankGauging', TankGaugingSchema);
