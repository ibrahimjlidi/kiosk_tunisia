import { api } from './api';
import { AgingBucket } from '../types/customer';
import { Sale } from '../types/sale';

export const fetchCreditAging = async (station?: string): Promise<{ success: boolean; data: AgingBucket[] }> => {
  const res = await api.get('/reports/credits/aging', { params: station ? { station } : undefined });
  return res.data;
};

export const fetchSales = async (params?: any): Promise<{ success: boolean; count: number; sales: Sale[] }> => {
  const res = await api.get('/sales', { params });
  return res.data;
};

export const fetchAnalyticsSummary = async (params?: { date?: string; station?: string }) => {
  const res = await api.get('/reports/summary', { params });
  return res.data;
};

export const fetchDailyClosureSummary = async (params?: any) => {
  const res = await api.get('/daily-closures/summary', { params });
  return res.data;
};

export const fetchDailyClosures = async (params?: any) => {
  const res = await api.get('/daily-closures', { params });
  return res.data;
};

export const finalizeDailyClosure = async (data: any) => {
  const res = await api.post('/daily-closures/close', data);
  return res.data;
};
