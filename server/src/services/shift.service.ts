import mongoose from 'mongoose';
import { Pump, IPump } from '../models/Pump';
import { IShift, IPumpReading } from '../models/Shift';

/**
 * Calculate all financial fields for a single pistol reading.
 * Volume = Closing - Opening
 * HT     = Volume × SellingPrice / (1 + VAT/100)
 * VAT    = HT × VAT/100
 * TTC    = Volume × SellingPrice
 * Profit = Volume × (SellingPrice - PurchasePrice)
 */
export const calcPistolFinancials = (
  openingIndex: number,
  closingIndex: number,
  sellingPrice: number,
  purchasePrice: number,
  vatRate: number
) => {
  const volumeSold  = Math.max(0, closingIndex - openingIndex);
  const amountTTC   = parseFloat((volumeSold * sellingPrice).toFixed(3));
  const amountHT    = parseFloat((amountTTC / (1 + vatRate / 100)).toFixed(3));
  const vatAmount   = parseFloat((amountTTC - amountHT).toFixed(3));
  const profit      = parseFloat((volumeSold * (sellingPrice - purchasePrice)).toFixed(3));
  return { volumeSold: parseFloat(volumeSold.toFixed(3)), amountHT, vatAmount, amountTTC, profit };
};

/**
 * Aggregate all pump readings into top-level financial totals for a shift.
 */
export const aggregateShiftTotals = (pumpReadings: IPumpReading[]) => {
  let totalSalesHT   = 0;
  let totalVAT       = 0;
  let totalSalesTTC  = 0;
  let totalProfit    = 0;
  const productMap: Record<string, { productName: string; volumeSold: number }> = {};

  for (const pump of pumpReadings) {
    for (const pr of pump.pistolReadings) {
      totalSalesHT  += pr.amountHT;
      totalVAT      += pr.vatAmount;
      totalSalesTTC += pr.amountTTC;
      totalProfit   += pr.profit;

      const pid = pr.product.toString();
      if (!productMap[pid]) {
        productMap[pid] = { productName: pr.productName, volumeSold: 0 };
      }
      productMap[pid].volumeSold += pr.volumeSold;
    }
  }

  const totalVolumeByProduct = Object.entries(productMap).map(([product, val]) => ({
    product: new mongoose.Types.ObjectId(product),
    productName: val.productName,
    volumeSold: parseFloat(val.volumeSold.toFixed(3)),
  }));

  return {
    totalSalesHT:  parseFloat(totalSalesHT.toFixed(3)),
    totalVAT:      parseFloat(totalVAT.toFixed(3)),
    totalSalesTTC: parseFloat(totalSalesTTC.toFixed(3)),
    totalProfit:   parseFloat(totalProfit.toFixed(3)),
    totalVolumeByProduct,
  };
};

/**
 * Get the previous shift's closing indexes to use as opening indexes for a new shift.
 * Returns a map: pistolId => closingIndex
 */
export const getPreviousClosingIndexes = async (
  stationId: mongoose.Types.ObjectId | string,
  shiftDate: Date,
  shiftNumber: number        // 1=Morning, 2=Afternoon, 3=Night
): Promise<Map<string, number>> => {
  const indexMap = new Map<string, number>();
  
  // For Shift 1 (Morning), look at Night shift of previous day
  // For Shift 2/3, look at previous shift same day
  const { Shift } = await import('../models/Shift');
  let previousShift: IShift | null = null;

  if (shiftNumber === 1) {
    // Previous day's Night shift
    const prevDay = new Date(shiftDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const dayStart = new Date(prevDay); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(prevDay); dayEnd.setHours(23, 59, 59, 999);
    previousShift = await Shift.findOne({
      station: stationId,
      shiftType: 'NIGHT',
      shiftDate: { $gte: dayStart, $lte: dayEnd },
      status: 'CLOSED',
    }).sort({ closedAt: -1 });
  } else {
    // Same day, previous shift number
    const dayStart = new Date(shiftDate); dayStart.setHours(0, 0, 0, 0);
    const dayEnd   = new Date(shiftDate); dayEnd.setHours(23, 59, 59, 999);
    const prevType = shiftNumber === 2 ? 'MORNING' : 'AFTERNOON';
    previousShift = await Shift.findOne({
      station: stationId,
      shiftType: prevType,
      shiftDate: { $gte: dayStart, $lte: dayEnd },
      status: 'CLOSED',
    });
  }

  if (previousShift) {
    for (const pr of previousShift.pumpReadings) {
      for (const pistol of pr.pistolReadings) {
        indexMap.set(pistol.pistolId.toString(), pistol.closingIndex);
      }
    }
  }

  return indexMap;
};

/**
 * Build initial pump readings from DB pumps, using previous closing indexes.
 */
export const buildInitialPumpReadings = async (
  stationId: mongoose.Types.ObjectId | string,
  shiftDate: Date,
  shiftNumber: number
): Promise<IPumpReading[]> => {
  const pumps: IPump[] = await Pump.find({ station: stationId, active: true })
    .populate('pistols.product', 'name code purchasePrice sellingPrice vatRate');

  const prevIndexes = await getPreviousClosingIndexes(stationId, shiftDate, shiftNumber);
  
  const readings: IPumpReading[] = pumps.map((pump) => ({
    pump: pump._id as mongoose.Types.ObjectId,
    pumpNumber: pump.pumpNumber,
    pistolReadings: pump.pistols
      .filter((p) => p.active)
      .map((pistol) => {
        const product = pistol.product as any;
        const prevClosing = prevIndexes.get(pistol._id?.toString() || '') ?? pistol.currentClosingIndex;
        return {
          pistolId:     pistol._id as mongoose.Types.ObjectId,
          pistolNumber: pistol.pistolNumber,
          product:      product._id,
          productName:  product.name,
          productCode:  product.code,
          purchasePrice: product.purchasePrice,
          sellingPrice:  product.sellingPrice,
          vatRate:       product.vatRate,
          openingIndex:  prevClosing,
          closingIndex:  prevClosing,   // same as opening until operator fills in
          volumeSold:    0,
          amountHT:      0,
          vatAmount:     0,
          amountTTC:     0,
          profit:        0,
        };
      }),
  }));

  return readings;
};

/**
 * After shift closure, roll over closing indexes → currentClosingIndex on each Pump pistol.
 */
export const rolloverIndexesToPumps = async (pumpReadings: IPumpReading[]): Promise<void> => {
  for (const pr of pumpReadings) {
    const pump = await Pump.findById(pr.pump);
    if (!pump) continue;
    for (const pistolReading of pr.pistolReadings) {
      const pistol = pump.pistols.find(
        (p) => p._id?.toString() === pistolReading.pistolId.toString()
      );
      if (pistol) {
        pistol.currentClosingIndex = pistolReading.closingIndex;
      }
    }
    await pump.save();
  }
};
