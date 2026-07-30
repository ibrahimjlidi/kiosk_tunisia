import mongoose from 'mongoose';
import { Sale } from '../models/Sale';

/** Aggregate sales by day for a date range and optional station */
export const aggregateSalesByDay = async (startDate?: string, endDate?: string, station?: string) => {
  const match: any = {};
  if (station) match.station = new mongoose.Types.ObjectId(station);
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
  if (station) match.station = new mongoose.Types.ObjectId(station);
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
  if (station) match.station = new mongoose.Types.ObjectId(station);
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
