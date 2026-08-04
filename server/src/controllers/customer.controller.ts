import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { CreditTransaction } from '../models/CreditTransaction';
import mongoose from 'mongoose';
import { normalizeApiError } from '../helpers/errorResponse';

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) { res.status(400).json({ success: false, message: 'Name is required' }); return; }
    const customer = await Customer.create({ name, phone, email, address });
    res.status(201).json({ success: true, customer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to create customer.') });
  }
};

export const listCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load customers.') });
  }
};

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) { res.status(404).json({ success: false, message: 'Customer not found' }); return; }
    res.status(200).json({ success: true, customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load customer.') });
  }
};

export const addCreditTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { type, amount, referenceId, notes, station } = req.body;
    if (!type || amount === undefined) { res.status(400).json({ success: false, message: 'type and amount required' }); return; }

    const customer = await Customer.findById(customerId);
    if (!customer) { res.status(404).json({ success: false, message: 'Customer not found' }); return; }

    const signedAmount = Number(amount);
    if (!Number.isFinite(signedAmount) || signedAmount === 0) {
      res.status(400).json({ success: false, message: 'Transaction amount must be a non-zero numeric value.' });
      return;
    }

    const normalizedAmount = type === 'PAYMENT' ? -Math.abs(signedAmount) : Math.abs(signedAmount);
    if (type === 'PAYMENT' && customer.creditBalance < Math.abs(normalizedAmount)) {
      res.status(400).json({ success: false, message: 'Payment amount exceeds the customer current credit balance.' });
      return;
    }

    const tx = await CreditTransaction.create({
      customer: customer._id,
      station: station ? new mongoose.Types.ObjectId(station) : undefined,
      type,
      referenceId: referenceId ? new mongoose.Types.ObjectId(referenceId) : undefined,
      amount: normalizedAmount,
      notes,
    });

    customer.creditBalance = parseFloat((customer.creditBalance + normalizedAmount).toFixed(3));
    await customer.save();

    res.status(201).json({ success: true, tx, customer });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to create credit transaction.') });
  }
};

export const listCustomerTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const txs = await CreditTransaction.find({ customer: customerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: txs.length, transactions: txs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load customer transactions.') });
  }
};
