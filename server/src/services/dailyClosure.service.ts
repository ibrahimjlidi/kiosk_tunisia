import { Shift } from '../models/Shift';
import { Expense } from '../models/Expense';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { KifReturn } from '../models/KifReturn';
import { DailyClosure } from '../models/DailyClosure';
import { query } from '../config/db';

export interface DailyClosureSummaryInput {
  salesTTC: number;
  shiftSalesLedgerTTC: number;
  totalPayments: number;
  expenses: number;
  purchases: number;
  kifQuantity: number;
  openShiftCount: number;
}

export interface DailyClosureSummary extends DailyClosureSummaryInput {
  totalSalesTTC: number;
  totalExpenses: number;
  totalPurchases: number;
  totalKifQuantity: number;
  variance: number;
  shiftSalesLedgerVariance: number;
  isBalanced: boolean;
}

export const buildDailyClosureSummary = (input: DailyClosureSummaryInput): DailyClosureSummary => {
  const variance = input.totalPayments - input.salesTTC;
  const shiftSalesLedgerVariance = parseFloat((input.shiftSalesLedgerTTC - input.salesTTC).toFixed(3));
  return {
    ...input,
    totalSalesTTC: input.salesTTC,
    totalExpenses: input.expenses,
    totalPurchases: input.purchases,
    totalKifQuantity: input.kifQuantity,
    variance,
    shiftSalesLedgerVariance,
    isBalanced: Math.abs(variance) < 0.001 && Math.abs(shiftSalesLedgerVariance) < 0.001,
  };
};

export class DailyClosureNotReadyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DailyClosureNotReadyError';
  }
}

export const assertDailyClosureReady = (summary: DailyClosureSummary): void => {
  if (summary.openShiftCount > 0) {
    throw new DailyClosureNotReadyError(`Cannot finalize daily closure while ${summary.openShiftCount} shift(s) remain open.`);
  }
  if (Math.abs(summary.variance) >= 0.001) {
    throw new DailyClosureNotReadyError(`Cannot finalize daily closure with a payment variance of ${summary.variance.toFixed(3)} TND.`);
  }
  if (Math.abs(summary.shiftSalesLedgerVariance) >= 0.001) {
    throw new DailyClosureNotReadyError(
      `Cannot finalize daily closure: shift sales differ from the sales ledger by ${summary.shiftSalesLedgerVariance.toFixed(3)} TND.`,
    );
  }
};

export const getDailyClosureSummary = async (stationId?: string, date?: Date | string) => {
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

  const stationCondition = stationId ? 'AND shifts.station_id = ?' : '';
  const ledgerValues = stationId ? [dayStart, dayEnd, stationId] : [dayStart, dayEnd];
  const ledgerRows = await query<{ total: number }>(
    `SELECT COALESCE(SUM(sales.amount_ttc), 0) AS total
     FROM sales
     INNER JOIN shifts ON shifts.id = sales.shift_id
     WHERE shifts.shift_date >= ? AND shifts.shift_date <= ? ${stationCondition}`,
    ledgerValues,
  );
  const ledgerTotal = ledgerRows[0];
  if (!ledgerTotal) throw new Error('Unable to calculate shift sales ledger total.');

  const salesTTC = shifts.reduce((sum: number, shift: any) => sum + (shift.totalSalesTTC || 0), 0);
  const totalPayments = shifts.reduce((sum: number, shift: any) => sum + (shift.totalPayments || 0), 0);
  const expensesTotal = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0);
  const purchasesTotal = purchaseOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
  const kifQuantity = kifReturns.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

  return buildDailyClosureSummary({
    salesTTC,
    shiftSalesLedgerTTC: Number(ledgerTotal.total),
    totalPayments,
    expenses: expensesTotal,
    purchases: purchasesTotal,
    kifQuantity,
    openShiftCount: Number(openShifts),
  });
};

export const getDailyClosures = async (stationId?: string) => {
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
  stationId: string;
  date: Date | string;
  userId: string;
  notes?: string;
}) => {
  const targetDate = new Date(date);
  const dayStart = new Date(targetDate); dayStart.setHours(0, 0, 0, 0);
  const dayStartKey = new Date(dayStart);
  const summary = await getDailyClosureSummary(stationId, dayStartKey);
  assertDailyClosureReady(summary);

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
