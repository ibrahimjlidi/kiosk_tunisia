import { Expense } from '../models/Expense';

export const fetchExpenses = async () => {
  return Expense.find()
    .sort({ createdAt: -1 })
    .populate('supplier', 'name')
    .populate('station', 'name code')
    .lean();
};

export const createExpense = async (data: {
  station?: string;
  supplier?: string;
  type: 'OPERATING' | 'MAINTENANCE' | 'UTILITY' | 'OTHER';
  description: string;
  amount: number;
  paid?: boolean;
  notes?: string;
}) => {
  return Expense.create(data);
};

export const updateExpense = async (id: string, data: Partial<{ paid: boolean; notes?: string }>) => {
  return Expense.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};
