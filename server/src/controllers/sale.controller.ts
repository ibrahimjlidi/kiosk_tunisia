import { Request, Response } from 'express';
import { Sale } from '../models/Sale';
import { CreditTransaction } from '../models/CreditTransaction';
import { Customer } from '../models/Customer';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body;
    // Basic validation
    const required = ['station','product','productName','productCode','quantity','purchasePrice','sellingPrice','amountHT','vatAmount','amountTTC','profit'];
    for (const key of required) {
      if (data[key] === undefined) {
        res.status(400).json({ success: false, message: `${key} is required` });
        return;
      }
    }

    // If sale is on credit, customerId is required and we will create a credit transaction
    // Support partial payment allocation (payments.credit) or full credit via paymentMethod
    const creditAmount = (data.payments && data.payments.credit) ? parseFloat(data.payments.credit) : (data.paymentMethod === 'CREDIT' ? parseFloat(data.amountTTC) : 0);
    if (creditAmount > 0) {
      if (!data.customer) {
        res.status(400).json({ success: false, message: 'customer is required when there is a credit amount' });
        return;
      }

      const customer = await Customer.findById(data.customer);
      if (!customer) {
        res.status(404).json({ success: false, message: 'Customer not found' });
        return;
      }

      const sale = await Sale.create({ ...data, employee: req.user?.id });

      // Create credit transaction only for the credit portion
      await CreditTransaction.create({
        customer: new mongoose.Types.ObjectId(customer._id),
        station: data.station ? new mongoose.Types.ObjectId(data.station) : undefined,
        type: 'SALE',
        referenceId: sale._id,
        amount: creditAmount,
        notes: `Credit portion for sale ${sale._id}`,
      });

      customer.creditBalance = parseFloat((customer.creditBalance + creditAmount).toFixed(3));
      await customer.save();

      res.status(201).json({ success: true, sale, creditCustomer: customer, creditAmount });
      return;
    }

    const sale = await Sale.create({
      ...data,
      employee: req.user?.id,
    });

    res.status(201).json({ success: true, sale });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.station) filter.station = req.query.station;
    if (req.query.shift) filter.shift = req.query.shift;
    if (req.query.product) filter.product = req.query.product;
    if (req.query.date) {
      const day = new Date(req.query.date as string);
      const start = new Date(day); start.setHours(0,0,0,0);
      const end = new Date(day); end.setHours(23,59,59,999);
      filter.createdAt = { $gte: start, $lte: end };
    }
    const sales = await Sale.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sales.length, sales });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) { res.status(404).json({ success: false, message: 'Sale not found' }); return; }
    res.status(200).json({ success: true, sale });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
