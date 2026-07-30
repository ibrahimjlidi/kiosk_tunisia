import { Request, Response } from 'express';
import { fetchExpenses, createExpense, updateExpense } from '../services/expense.service';

export const listExpenses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await fetchExpenses();
    res.status(200).json({ success: true, count: expenses.length, expenses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching expenses' });
  }
};

export const addExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await createExpense(req.body);
    res.status(201).json({ success: true, expense });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error creating expense' });
  }
};

export const patchExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await updateExpense(req.params.id, req.body);
    if (!expense) {
      res.status(404).json({ success: false, message: 'Expense not found' });
      return;
    }
    res.status(200).json({ success: true, expense });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error updating expense' });
  }
};
