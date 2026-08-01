import { api } from './api';
import { ProductPurchase } from '../types/purchase';

export const fetchPurchases = async (params?: { product?: string; station?: string; supplier?: string }) => {
  const response = await api.get<{ success: boolean; count: number; purchases: ProductPurchase[] }>('/purchases', { params });
  return response.data;
};

export const createPurchase = async (data: {
  product: string;
  station?: string;
  supplier?: string;
  quantity: number;
  unitCost: number;
  notes?: string;
}) => {
  const response = await api.post<{ success: boolean; purchase: ProductPurchase }>('/purchases', data);
  return response.data;
};
