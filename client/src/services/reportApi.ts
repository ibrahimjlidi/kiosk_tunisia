import { api } from './api';
import { AgingBucket } from '../types/customer';
import { Sale } from '../types/shift';

export const fetchCreditAging = async (station?: string): Promise<{ success: boolean; data: AgingBucket[] }> => {
  const res = await api.get('/reports/credits/aging', { params: station ? { station } : undefined });
  return res.data;
};

export const fetchSales = async (params?: any): Promise<{ success: boolean; count: number; sales: Sale[] }> => {
  const res = await api.get('/sales', { params });
  return res.data;
};
