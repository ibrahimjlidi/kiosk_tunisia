import mongoose from 'mongoose';
import { Expense } from '../models/Expense';
import { ProductPurchase } from '../models/ProductPurchase';
import { Sale } from '../models/Sale';
import { Shift } from '../models/Shift';

/** Aggregate sales by day for a date range and optional station */
export const aggregateSalesByDay = async (startDate?: string, endDate?: string, station?: string) => {
  const match: any = {};
  if (station) {
    try {
      match.station = new mongoose.Types.ObjectId(station);
    } catch {
      match.station = station;
    }
  }
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    match.createdAt = { $gte: start, $lte: end };
  }

  const pipeline: any[] = [
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalQuantity: { $sum: '$quantity' },
        totalHT: { $sum: '$amountHT' },
        totalVAT: { $sum: '$vatAmount' },
        totalTTC: { $sum: '$amountTTC' },
        totalProfit: { $sum: '$profit' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id': 1 } },
  ];

  return Sale.aggregate(pipeline);
};

/** Aggregate sales by product for a specific date (or date range) */
export const aggregateSalesByProduct = async (startDate?: string, endDate?: string, station?: string) => {
  const match: any = {};
  if (station) {
    try {
      match.station = new mongoose.Types.ObjectId(station);
    } catch {
      match.station = station;
    }
  }
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    match.createdAt = { $gte: start, $lte: end };
  }

  const pipeline: any[] = [
    { $match: match },
    {
      $group: {
        _id: '$product',
        productName: { $first: '$productName' },
        productCode: { $first: '$productCode' },
        totalQuantity: { $sum: '$quantity' },
        totalHT: { $sum: '$amountHT' },
        totalVAT: { $sum: '$vatAmount' },
        totalTTC: { $sum: '$amountTTC' },
        totalProfit: { $sum: '$profit' },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalQuantity: -1 } },
  ];

  return Sale.aggregate(pipeline);
};

/** Aggregate sales by shift for a specific date */
export const aggregateSalesByShift = async (date?: string, station?: string) => {
  const match: any = {};
  if (station) {
    try {
      match.station = new mongoose.Types.ObjectId(station);
    } catch {
      match.station = station;
    }
  }
  if (date) {
    const day = new Date(date);
    const start = new Date(day); start.setHours(0,0,0,0);
    const end = new Date(day); end.setHours(23,59,59,999);
    match.createdAt = { $gte: start, $lte: end };
  }

  const pipeline: any[] = [
    { $match: match },
    {
      $group: {
        _id: '$shift',
        totalQuantity: { $sum: '$quantity' },
        totalHT: { $sum: '$amountHT' },
        totalVAT: { $sum: '$vatAmount' },
        totalTTC: { $sum: '$amountTTC' },
        totalProfit: { $sum: '$profit' },
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'shifts',
        localField: '_id',
        foreignField: '_id',
        as: 'shift',
      },
    },
    { $unwind: { path: '$shift', preserveNullAndEmptyArrays: true } },
    { $sort: { 'shift.shiftNumber': 1 } },
  ];

  return Sale.aggregate(pipeline);
};

export const getAnalyticsSummary = async (date?: string, station?: string) => {
  const day = date ? new Date(date) : new Date();
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(day); end.setHours(23, 59, 59, 999);

  const salesMatch: any = { createdAt: { $gte: start, $lte: end } };
  if (station) {
    try {
      salesMatch.station = new mongoose.Types.ObjectId(station);
    } catch {
      salesMatch.station = station;
    }
  }

  const [salesSummary, productMix, shifts, expenseSummary, purchaseSummary] = await Promise.all([
    Sale.aggregate([
      { $match: salesMatch },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalHT: { $sum: '$amountHT' },
          totalVAT: { $sum: '$vatAmount' },
          totalTTC: { $sum: '$amountTTC' },
          totalProfit: { $sum: '$profit' },
          totalOrders: { $sum: 1 },
        },
      },
    ]),
    Sale.aggregate([
      { $match: salesMatch },
      {
        $group: {
          _id: '$product',
          productName: { $first: '$productName' },
          productCode: { $first: '$productCode' },
          totalQuantity: { $sum: '$quantity' },
          totalTTC: { $sum: '$amountTTC' },
          totalProfit: { $sum: '$profit' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]),
    Shift.find({
      shiftDate: { $gte: start, $lte: end },
      ...(station ? { station: new mongoose.Types.ObjectId(station) } : {}),
    }).select('shiftType shiftDate status totalSalesTTC totalPayments balance isBalanced').lean(),
    Expense.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          ...(station ? { station: new mongoose.Types.ObjectId(station) } : {}),
        },
      },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    ProductPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          ...(station ? { station: new mongoose.Types.ObjectId(station) } : {}),
        },
      },
      { $group: { _id: null, totalPurchases: { $sum: '$totalCost' }, count: { $sum: 1 } } },
    ]),
  ]);

  const sales = salesSummary[0] || { totalQuantity: 0, totalHT: 0, totalVAT: 0, totalTTC: 0, totalProfit: 0, totalOrders: 0 };
  const expenses = expenseSummary[0] || { totalExpenses: 0, count: 0 };
  const purchases = purchaseSummary[0] || { totalPurchases: 0, count: 0 };

  return {
    date: day.toISOString().slice(0, 10),
    station: station || undefined,
    sales: {
      totalQuantity: sales.totalQuantity || 0,
      totalHT: sales.totalHT || 0,
      totalVAT: sales.totalVAT || 0,
      totalTTC: sales.totalTTC || 0,
      totalProfit: sales.totalProfit || 0,
      totalOrders: sales.totalOrders || 0,
    },
    productMix,
    audit: {
      totalExpenses: expenses.totalExpenses || 0,
      totalPurchases: purchases.totalPurchases || 0,
      openShifts: shifts.filter((shift: any) => shift.status === 'OPEN').length,
      closedShifts: shifts.filter((shift: any) => shift.status === 'CLOSED').length,
      totalPayments: shifts.reduce((sum: number, shift: any) => sum + (shift.totalPayments || 0), 0),
      totalSalesTTC: shifts.reduce((sum: number, shift: any) => sum + (shift.totalSalesTTC || 0), 0),
    },
    shifts: shifts.map((shift: any) => ({
      _id: shift._id,
      shiftType: shift.shiftType,
      shiftDate: shift.shiftDate,
      status: shift.status,
      totalSalesTTC: shift.totalSalesTTC || 0,
      totalPayments: shift.totalPayments || 0,
      balance: shift.balance || 0,
      isBalanced: shift.isBalanced || false,
    })),
  };
};
