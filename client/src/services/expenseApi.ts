import { api } from './api';
import { Expense, ExpenseType } from '../types/expense';

export const fetchExpenses = async (): Promise<{ success: boolean; count: number; expenses: Expense[] }> => {
  const response = await api.get<{ success: boolean; count: number; expenses: Expense[] }>('/expenses');
  return response.data;
};

export const createExpense = async (data: {
  station?: string;
  supplier?: string;
  type: ExpenseType;
  description: string;
  amount: number;
  paid?: boolean;
  notes?: string;
}) => {
  const response = await api.post<{ success: boolean; expense: Expense }>('/expenses', data);
  return response.data;
};

export const patchExpense = async (id: string, data: Partial<{ paid: boolean; notes?: string }>) => {
  const response = await api.patch<{ success: boolean; expense: Expense }>(`/expenses/${id}`, data);
  return response.data;
};
