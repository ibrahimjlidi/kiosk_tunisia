export type ExpenseType = 'OPERATING' | 'MAINTENANCE' | 'UTILITY' | 'OTHER';

export interface Expense {
  _id: string;
  station?: {
    _id: string;
    name: string;
    code: string;
  };
  supplier?: {
    _id: string;
    name: string;
  };
  type: ExpenseType;
  description: string;
  amount: number;
  paid: boolean;
  notes?: string;
  createdAt?: string;
}
