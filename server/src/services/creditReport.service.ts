import { query } from '../config/db';

/**
 * Build aging buckets for credit transactions per customer.
 * Buckets: 0-30, 31-60, 61-90, and over 90 days.
 */
export const creditAgingReport = async (station?: string) => {
  const where = station ? 'WHERE ct.station_id = ?' : '';
  const values = station ? [station] : [];
  return query(
    `SELECT JSON_OBJECT(
         '_id', c.id, 'name', c.name, 'phone', c.phone, 'creditBalance', c.credit_balance
       ) AS customer,
       SUM(ct.amount) AS totalBalance,
       SUM(CASE WHEN DATEDIFF(CURRENT_DATE, DATE(ct.created_at)) BETWEEN 0 AND 30 THEN ct.amount ELSE 0 END) AS bucket0_30,
       SUM(CASE WHEN DATEDIFF(CURRENT_DATE, DATE(ct.created_at)) BETWEEN 31 AND 60 THEN ct.amount ELSE 0 END) AS bucket31_60,
       SUM(CASE WHEN DATEDIFF(CURRENT_DATE, DATE(ct.created_at)) BETWEEN 61 AND 90 THEN ct.amount ELSE 0 END) AS bucket61_90,
       SUM(CASE WHEN DATEDIFF(CURRENT_DATE, DATE(ct.created_at)) > 90 THEN ct.amount ELSE 0 END) AS bucket90p,
       MAX(ct.created_at) AS lastTxAt
     FROM credit_transactions ct
     JOIN customers c ON c.id = ct.customer_id
     ${where}
     GROUP BY c.id, c.name, c.phone, c.credit_balance
     ORDER BY totalBalance DESC`,
    values,
  );
};
