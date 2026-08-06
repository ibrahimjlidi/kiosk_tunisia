import { Shift, IPumpReading } from '../models/Shift';
import { Sale } from '../models/Sale';
import { Tank } from '../models/Tank';
import mongoose from 'mongoose';

/**
 * Create Sale documents from a closed shift's pump readings.
 * Returns number of sales created.
 */
export const createSalesForShift = async (shiftId: mongoose.Types.ObjectId | string) => {
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

  await Sale.insertMany(created);

  // Deduct from Tanks
  for (const doc of created) {
    if (doc.quantity > 0) {
      await Tank.updateOne(
        { station: doc.station, product: doc.product },
        { $inc: { currentStock: -doc.quantity } }
      );
    }
  }

  return created.length;
};
