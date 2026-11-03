import { query } from '../config/db';

type SummaryOptions = { station?: string; start?: Date; end?: Date };
const conditions = ({ station, start, end }: SummaryOptions, column = 's.created_at') => {
  const clauses: string[] = [];
  const values: any[] = [];
  if (station) { clauses.push(`${column.split('.')[0]}.station_id = ?`); values.push(station); }
  if (start) { clauses.push(`${column} >= ?`); values.push(start); }
  if (end) { clauses.push(`${column} <= ?`); values.push(end); }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values };
};
const dateRange = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return {};
  const start = startDate ? new Date(startDate) : new Date('1970-01-01');
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/** Aggregate sales by day for a date range and optional station. */
export const aggregateSalesByDay = async (startDate?: string, endDate?: string, station?: string) => {
  const filter = conditions({ ...dateRange(startDate, endDate), station });
  return query(
    `SELECT DATE_FORMAT(s.created_at, '%Y-%m-%d') AS _id,
       SUM(s.quantity) AS totalQuantity, SUM(s.amount_ht) AS totalHT,
       SUM(s.vat_amount) AS totalVAT, SUM(s.amount_ttc) AS totalTTC,
       SUM(s.profit) AS totalProfit, COUNT(*) AS count
     FROM sales s ${filter.where} GROUP BY DATE(s.created_at) ORDER BY DATE(s.created_at)`,
    filter.values,
  );
};

/** Aggregate sales by product for a date range and optional station. */
export const aggregateSalesByProduct = async (startDate?: string, endDate?: string, station?: string) => {
  const filter = conditions({ ...dateRange(startDate, endDate), station });
  return query(
    `SELECT s.product_id AS _id, MAX(s.product_name) AS productName, MAX(s.product_code) AS productCode,
       SUM(s.quantity) AS totalQuantity, SUM(s.amount_ht) AS totalHT,
       SUM(s.vat_amount) AS totalVAT, SUM(s.amount_ttc) AS totalTTC,
       SUM(s.profit) AS totalProfit, COUNT(*) AS count
     FROM sales s ${filter.where} GROUP BY s.product_id ORDER BY totalQuantity DESC`,
    filter.values,
  );
};

/** Aggregate sales by shift for a date and optional station. */
export const aggregateSalesByShift = async (date?: string, station?: string) => {
  const range = dateRange(date, date);
  const filter = conditions({ ...range, station });
  return query(
    `SELECT s.shift_id AS _id, SUM(s.quantity) AS totalQuantity, SUM(s.amount_ht) AS totalHT,
       SUM(s.vat_amount) AS totalVAT, SUM(s.amount_ttc) AS totalTTC,
       SUM(s.profit) AS totalProfit, COUNT(*) AS count,
       CASE WHEN sh.id IS NULL THEN NULL ELSE JSON_OBJECT(
         '_id', sh.id, 'shiftNumber', sh.shift_number, 'shiftType', sh.shift_type, 'shiftDate', sh.shift_date
       ) END AS shift
     FROM sales s LEFT JOIN shifts sh ON sh.id = s.shift_id
     ${filter.where} GROUP BY s.shift_id, sh.id ORDER BY sh.shift_number`,
    filter.values,
  );
};

export const getAnalyticsSummary = async (date?: string, station?: string) => {
  const day = date ? new Date(date) : new Date();
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(day); end.setHours(23, 59, 59, 999);
  const salesFilter = conditions({ station, start, end });
  const otherFilter = (alias: string) => {
    const clauses = [`${alias}.created_at >= ?`, `${alias}.created_at <= ?`];
    const values: any[] = [start, end];
    if (station) { clauses.push(`${alias}.station_id = ?`); values.push(station); }
    return { where: `WHERE ${clauses.join(' AND ')}`, values };
  };
  const expenseFilter = otherFilter('e');
  const purchaseFilter = otherFilter('p');
  const shiftFilter = conditions({ station, start, end }, 'sh.shift_date');

  const [salesRows, productMix, shifts, expenseRows, purchaseRows] = await Promise.all([
    query<any>(
      `SELECT SUM(s.quantity) AS totalQuantity, SUM(s.amount_ht) AS totalHT, SUM(s.vat_amount) AS totalVAT,
         SUM(s.amount_ttc) AS totalTTC, SUM(s.profit) AS totalProfit, COUNT(*) AS totalOrders
       FROM sales s ${salesFilter.where}`,
      salesFilter.values,
    ),
    query(
      `SELECT s.product_id AS _id, MAX(s.product_name) AS productName, MAX(s.product_code) AS productCode,
         SUM(s.quantity) AS totalQuantity, SUM(s.amount_ttc) AS totalTTC,
         SUM(s.profit) AS totalProfit, COUNT(*) AS count
       FROM sales s ${salesFilter.where} GROUP BY s.product_id ORDER BY totalQuantity DESC`,
      salesFilter.values,
    ),
    query<any>(
      `SELECT sh.id AS _id, sh.shift_type AS shiftType, sh.shift_date AS shiftDate, sh.status,
         sh.total_sales_ttc AS totalSalesTTC, sh.total_payments AS totalPayments,
         sh.balance, sh.is_balanced AS isBalanced
       FROM shifts sh ${shiftFilter.where}`,
      shiftFilter.values,
    ),
    query<any>(
      `SELECT SUM(e.amount) AS totalExpenses, COUNT(*) AS count FROM expenses e ${expenseFilter.where}`,
      expenseFilter.values,
    ),
    query<any>(
      `SELECT SUM(p.total_cost) AS totalPurchases, COUNT(*) AS count FROM product_purchases p ${purchaseFilter.where}`,
      purchaseFilter.values,
    ),
  ]);
  const sales = salesRows[0] ?? {};
  const expenses = expenseRows[0] ?? {};
  const purchases = purchaseRows[0] ?? {};
  return {
    date: day.toISOString().slice(0, 10),
    station: station || undefined,
    sales: {
      totalQuantity: Number(sales.totalQuantity ?? 0), totalHT: Number(sales.totalHT ?? 0),
      totalVAT: Number(sales.totalVAT ?? 0), totalTTC: Number(sales.totalTTC ?? 0),
      totalProfit: Number(sales.totalProfit ?? 0), totalOrders: Number(sales.totalOrders ?? 0),
    },
    productMix,
    audit: {
      totalExpenses: Number(expenses.totalExpenses ?? 0), totalPurchases: Number(purchases.totalPurchases ?? 0),
      openShifts: shifts.filter((shift: any) => shift.status === 'OPEN').length,
      closedShifts: shifts.filter((shift: any) => shift.status === 'CLOSED').length,
      totalPayments: shifts.reduce((sum: number, shift: any) => sum + Number(shift.totalPayments ?? 0), 0),
      totalSalesTTC: shifts.reduce((sum: number, shift: any) => sum + Number(shift.totalSalesTTC ?? 0), 0),
    },
    shifts: shifts.map((shift: any) => ({
      _id: shift._id, shiftType: shift.shiftType, shiftDate: shift.shiftDate,
      status: shift.status, totalSalesTTC: Number(shift.totalSalesTTC ?? 0),
      totalPayments: Number(shift.totalPayments ?? 0), balance: Number(shift.balance ?? 0),
      isBalanced: Boolean(shift.isBalanced),
    })),
  };
};
