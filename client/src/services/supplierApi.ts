import { api } from './api';
import { Supplier } from '../types/supplier';

export const fetchSuppliers = async (): Promise<{ success: boolean; count: number; suppliers: Supplier[] }> => {
  const response = await api.get<{ success: boolean; count: number; suppliers: Supplier[] }>('/suppliers');
  return response.data;
};

export const createSupplier = async (data: Partial<Supplier>) => {
  const response = await api.post<{ success: boolean; supplier: Supplier }>('/suppliers', data);
  return response.data;
};

export const updateSupplier = async (id: string, data: Partial<Supplier>) => {
  const response = await api.put<{ success: boolean; supplier: Supplier }>(`/suppliers/${id}`, data);
  return response.data;
};
