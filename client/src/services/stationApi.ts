import { api } from './api';
import { Product, Station, Tank, Pump } from '../types/station';

// Product API
export const fetchProducts = async (): Promise<{ success: boolean; products: Product[] }> => {
  const response = await api.get<{ success: boolean; products: Product[] }>('/products');
  return response.data;
};

export const createProduct = async (data: Partial<Product>): Promise<{ success: boolean; product: Product }> => {
  const response = await api.post<{ success: boolean; product: Product }>('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<{ success: boolean; product: Product }> => {
  const response = await api.put<{ success: boolean; product: Product }>(`/products/${id}`, data);
  return response.data;
};

// Station API
export const fetchStations = async (): Promise<{ success: boolean; stations: Station[] }> => {
  const response = await api.get<{ success: boolean; stations: Station[] }>('/stations');
  return response.data;
};

// Tank API
export const fetchTanks = async (stationId?: string): Promise<{ success: boolean; tanks: Tank[] }> => {
  const response = await api.get<{ success: boolean; tanks: Tank[] }>('/tanks', {
    params: { station: stationId },
  });
  return response.data;
};

// Pump API
export const fetchPumps = async (stationId?: string): Promise<{ success: boolean; pumps: Pump[] }> => {
  const response = await api.get<{ success: boolean; pumps: Pump[] }>('/pumps', {
    params: { station: stationId },
  });
  return response.data;
};
