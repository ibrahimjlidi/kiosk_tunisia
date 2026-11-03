import { Shift, IPumpReading } from '../models/Shift';
import { Sale } from '../models/Sale';
import { withTransaction } from '../config/db';
import { newId } from '../models/sqlModel';

/**
 * Create Sale documents from a closed shift's pump readings.
 * Returns number of sales created.
 */
export const createSalesForShift = async (shiftId: string) => {
  const shift = await Shift.findById(shiftId);
  if (!shift) return 0;

  const created: any[] = [];

  for (const pr of shift.pumpReadings) {
    for (const pistol of pr.pistolReadings) {
      if (!pistol || pistol.volumeSold <= 0) continue;

      const saleDoc = {
        station: shift.station,
        shift: shift._id,
        pump: pr.pump,
        pistol: pistol.pistolId,
        product: pistol.product,
        productName: pistol.productName,
        productCode: pistol.productCode,
        employee: shift.openedBy,
        quantity: pistol.volumeSold,
        purchasePrice: pistol.purchasePrice,
        sellingPrice: pistol.sellingPrice,
        vatRate: pistol.vatRate,
        amountHT: pistol.amountHT,
        vatAmount: pistol.vatAmount,
        amountTTC: pistol.amountTTC,
        profit: pistol.profit,
        paymentMethod: 'CASH', // default; actual payments are recorded separately per shift
      };

      created.push(saleDoc);
    }
  }

  if (created.length === 0) return 0;

  await withTransaction(async (connection) => {
    for (const doc of created) {
      const id = newId();
      await connection.execute(
        `INSERT INTO sales
         (id, station_id, shift_id, pump_id, pistol_id, product_id, product_name, product_code, employee_id,
          quantity, purchase_price, selling_price, vat_rate, amount_ht, vat_amount, amount_ttc, profit, payment_method, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3))`,
        [id, doc.station, doc.shift, doc.pump, doc.pistol, doc.product, doc.productName, doc.productCode, doc.employee,
          doc.quantity, doc.purchasePrice, doc.sellingPrice, doc.vatRate, doc.amountHT, doc.vatAmount, doc.amountTTC, doc.profit, doc.paymentMethod],
      );
      if (doc.quantity > 0) {
        await connection.execute(
          `UPDATE tanks SET current_stock = current_stock - ?
           WHERE id = (SELECT id FROM (SELECT id FROM tanks WHERE station_id = ? AND product_id = ? ORDER BY id LIMIT 1) AS matching_tank)`,
          [doc.quantity, doc.station, doc.product],
        );
      }
    }
  });

  return created.length;
};
