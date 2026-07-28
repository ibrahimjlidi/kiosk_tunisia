import mongoose, { Schema, Document } from 'mongoose';

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'NIGHT';
export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface IPumpReading {
  pump: mongoose.Types.ObjectId;
  pumpNumber: string;
  pistolReadings: {
    pistolId: mongoose.Types.ObjectId;
    pistolNumber: number;
    product: mongoose.Types.ObjectId;
    productName: string;
    productCode: string;
    purchasePrice: number;
    sellingPrice: number;
    vatRate: number;
    openingIndex: number;
    closingIndex: number;
    volumeSold: number;    // closingIndex - openingIndex
    amountHT: number;     // volumeSold * sellingPrice / (1 + vatRate/100)
    vatAmount: number;    // amountHT * vatRate / 100
    amountTTC: number;    // volumeSold * sellingPrice
    profit: number;       // volumeSold * (sellingPrice - purchasePrice)
  }[];
}

export interface IShift extends Document {
  station: mongoose.Types.ObjectId;
  shiftType: ShiftType;
  shiftDate: Date;
  shiftNumber: number;      // 1=Morning, 2=Afternoon, 3=Night
  status: ShiftStatus;
  openedBy: mongoose.Types.ObjectId;
  closedBy?: mongoose.Types.ObjectId;
  employees: mongoose.Types.ObjectId[];
  pumpReadings: IPumpReading[];

  // Financial Aggregates
  totalVolumeByProduct: { product: mongoose.Types.ObjectId; productName: string; volumeSold: number }[];
  totalSalesHT: number;
  totalVAT: number;
  totalSalesTTC: number;
  totalProfit: number;

  // Payments
  cashAmount: number;
  bankCardAmount: number;
  fuelCardAmount: number;
  bankTransferAmount: number;
  creditAmount: number;
  totalPayments: number;

  // Reconciliation
  balance: number;          // totalPayments - totalSalesTTC
  isBalanced: boolean;

  // Expenses
  totalExpenses: number;

  openedAt: Date;
  closedAt?: Date;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PistolReadingSchema = new Schema({
  pistolId:      { type: Schema.Types.ObjectId, required: true },
  pistolNumber:  { type: Number, required: true },
  product:       { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:   { type: String, required: true },
  productCode:   { type: String, required: true },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice:  { type: Number, default: 0 },
  vatRate:       { type: Number, default: 19 },
  openingIndex:  { type: Number, required: true, min: 0 },
  closingIndex:  { type: Number, required: true, min: 0 },
  volumeSold:    { type: Number, default: 0 },
  amountHT:     { type: Number, default: 0 },
  vatAmount:    { type: Number, default: 0 },
  amountTTC:    { type: Number, default: 0 },
  profit:        { type: Number, default: 0 },
}, { _id: false });

const PumpReadingSchema = new Schema({
  pump:           { type: Schema.Types.ObjectId, ref: 'Pump', required: true },
  pumpNumber:     { type: String, required: true },
  pistolReadings: [PistolReadingSchema],
}, { _id: false });

const ShiftSchema: Schema<IShift> = new Schema(
  {
    station:    { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    shiftType:  { type: String, enum: ['MORNING', 'AFTERNOON', 'NIGHT'], required: true },
    shiftDate:  { type: Date, required: true },
    shiftNumber:{ type: Number, enum: [1, 2, 3], required: true },
    status:     { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
    openedBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    closedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
    employees:  [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pumpReadings: [PumpReadingSchema],

    totalVolumeByProduct: [{
      product:     { type: Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      volumeSold:  { type: Number, default: 0 },
    }],
    totalSalesHT:  { type: Number, default: 0 },
    totalVAT:      { type: Number, default: 0 },
    totalSalesTTC: { type: Number, default: 0 },
    totalProfit:   { type: Number, default: 0 },

    cashAmount:         { type: Number, default: 0 },
    bankCardAmount:     { type: Number, default: 0 },
    fuelCardAmount:     { type: Number, default: 0 },
    bankTransferAmount: { type: Number, default: 0 },
    creditAmount:       { type: Number, default: 0 },
    totalPayments:      { type: Number, default: 0 },

    balance:     { type: Number, default: 0 },
    isBalanced:  { type: Boolean, default: false },
    totalExpenses: { type: Number, default: 0 },

    openedAt:  { type: Date, default: Date.now },
    closedAt:  { type: Date },
    notes:     { type: String, trim: true },
  },
  { timestamps: true }
);

// Compound index: one open shift per type per date per station
ShiftSchema.index({ station: 1, shiftDate: 1, shiftType: 1 }, { unique: true });

export const Shift = mongoose.model<IShift>('Shift', ShiftSchema);
