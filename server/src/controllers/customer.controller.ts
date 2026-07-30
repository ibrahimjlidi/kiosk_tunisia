import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { CreditTransaction } from '../models/CreditTransaction';
import mongoose from 'mongoose';

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name) { res.status(400).json({ success: false, message: 'Name is required' }); return; }
    const customer = await Customer.create({ name, phone, email, address });
    res.status(201).json({ success: true, customer });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const listCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) { res.status(404).json({ success: false, message: 'Customer not found' }); return; }
    res.status(200).json({ success: true, customer });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const addCreditTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { type, amount, referenceId, notes, station } = req.body;
    if (!type || amount === undefined) { res.status(400).json({ success: false, message: 'type and amount required' }); return; }

    const customer = await Customer.findById(customerId);
    if (!customer) { res.status(404).json({ success: false, message: 'Customer not found' }); return; }

    const tx = await CreditTransaction.create({
      customer: customer._id,
      station: station ? new mongoose.Types.ObjectId(station) : undefined,
      type,
      referenceId: referenceId ? new mongoose.Types.ObjectId(referenceId) : undefined,
      amount,
      notes,
    });

    // Update customer balance (charges increase balance, payments reduce)
    customer.creditBalance = parseFloat((customer.creditBalance + amount).toFixed(3));
    await customer.save();

    res.status(201).json({ success: true, tx, customer });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};

export const listCustomerTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const txs = await CreditTransaction.find({ customer: customerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: txs.length, transactions: txs });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
};
