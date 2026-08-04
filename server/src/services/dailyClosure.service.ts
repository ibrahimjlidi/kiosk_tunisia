import { Shift } from '../models/Shift';
import { Expense } from '../models/Expense';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { KifReturn } from '../models/KifReturn';
import { DailyClosure } from '../models/DailyClosure';
import mongoose from 'mongoose';

export interface DailyClosureSummaryInput {
  salesTTC: number;
  totalPayments: number;
  expenses: number;
  purchases: number;
  kifQuantity: number;
  openShiftCount?: number;
}

export interface DailyClosureSummary extends DailyClosureSummaryInput {
  totalSalesTTC: number;
  totalExpenses: number;
  totalPurchases: number;
  totalKifQuantity: number;
  variance: number;
  isBalanced: boolean;
}

export const buildDailyClosureSummary = (input: DailyClosureSummaryInput): DailyClosureSummary => {
  const variance = input.totalPayments - input.salesTTC;
  return {
    ...input,
    totalSalesTTC: input.salesTTC,
    totalExpenses: input.expenses,
    totalPurchases: input.purchases,
    totalKifQuantity: input.kifQuantity,
    variance,
    isBalanced: Math.abs(variance) < 0.001,
  };
};

export const getDailyClosureSummary = async (stationId?: string | mongoose.Types.ObjectId, date?: Date | string) => {
  const targetDate = date ? new Date(date) : new Date();
  const dayStart = new Date(targetDate); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate); dayEnd.setHours(23, 59, 59, 999);

  const filter: any = { shiftDate: { $gte: dayStart, $lte: dayEnd } };
  if (stationId) filter.station = stationId;

  const [shifts, expenses, purchaseOrders, kifReturns, openShifts] = await Promise.all([
    Shift.find(filter).lean(),
    Expense.find({ createdAt: { $gte: dayStart, $lte: dayEnd } }).lean(),
    PurchaseOrder.find({ createdAt: { $gte: dayStart, $lte: dayEnd } }).lean(),
    KifReturn.find({ date: { $gte: dayStart, $lte: dayEnd }, ...(stationId ? { station: stationId } : {}) }).lean(),
    Shift.countDocuments({ ...filter, status: 'OPEN' }),
  ]);

  const salesTTC = shifts.reduce((sum, shift) => sum + (shift.totalSalesTTC || 0), 0);
  const totalPayments = shifts.reduce((sum, shift) => sum + (shift.totalPayments || 0), 0);
  const expensesTotal = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const purchasesTotal = purchaseOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const kifQuantity = kifReturns.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return buildDailyClosureSummary({
    salesTTC,
    totalPayments,
    expenses: expensesTotal,
    purchases: purchasesTotal,
    kifQuantity,
    openShiftCount: openShifts,
  });
};

export const getDailyClosures = async (stationId?: string | mongoose.Types.ObjectId) => {
  const filter: any = {};
  if (stationId) filter.station = stationId;
  return DailyClosure.find(filter).populate('station', 'name code').populate('closedBy', 'firstName lastName').sort({ closureDate: -1 }).lean();
};

export const finalizeDailyClosure = async ({
  stationId,
  date,
  userId,
  notes,
}: {
  stationId: string | mongoose.Types.ObjectId;
  date: Date | string;
  userId: string | mongoose.Types.ObjectId;
  notes?: string;
}) => {
  const targetDate = new Date(date);
  const dayStart = new Date(targetDate); dayStart.setHours(0, 0, 0, 0);
  const dayStartKey = new Date(dayStart);
  const summary = await getDailyClosureSummary(stationId, dayStartKey);

  let closure = await DailyClosure.findOne({ station: stationId, closureDate: dayStartKey });
  if (!closure) {
    closure = await DailyClosure.create({
      station: stationId,
      closureDate: dayStartKey,
      status: 'CLOSED',
      salesTTC: summary.salesTTC,
      totalPayments: summary.totalPayments,
      totalExpenses: summary.expenses,
      totalPurchases: summary.purchases,
      totalKifQuantity: summary.kifQuantity,
      variance: summary.variance,
      isBalanced: summary.isBalanced,
      notes,
      closedBy: userId,
      closedAt: new Date(),
    });
    return closure;
  }

  closure.status = 'CLOSED';
  closure.salesTTC = summary.salesTTC;
  closure.totalPayments = summary.totalPayments;
  closure.totalExpenses = summary.expenses;
  closure.totalPurchases = summary.purchases;
  closure.totalKifQuantity = summary.kifQuantity;
  closure.variance = summary.variance;
  closure.isBalanced = summary.isBalanced;
  closure.notes = notes || closure.notes;
  closure.closedBy = userId as any;
  closure.closedAt = new Date();
  await closure.save();
  return closure;
};
