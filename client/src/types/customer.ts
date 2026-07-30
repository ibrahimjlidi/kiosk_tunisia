export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  creditBalance: number;
  createdAt?: string;
}

export interface CreditTransaction {
  _id: string;
  customer: string;
  station?: string;
  type: 'SALE' | 'PAYMENT' | 'ADJUSTMENT';
  referenceId?: string;
  amount: number;
  notes?: string;
  createdAt?: string;
}

export interface AgingBucket {
  customer: { _id: string; name: string; phone?: string; creditBalance: number };
  totalBalance: number;
  bucket0_30: number;
  bucket31_60: number;
  bucket61_90: number;
  bucket90p: number;
  lastTxAt?: string;
}
