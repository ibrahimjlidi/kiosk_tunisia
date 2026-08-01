import { api } from './api';
import { Product, Station, Tank, Pump } from '../types/station';

export type TankPayload = Omit<Partial<Tank>, 'station' | 'product'> & {
  station: string;
  product: string;
};

export type PumpPistolPayload = {
  pistolNumber: number;
  product: string;
  currentClosingIndex: number;
  active: boolean;
  _id?: string;
};

export type PumpPayload = Omit<Partial<Pump>, 'station' | 'pistols'> & {
  station: string;
  pistols: PumpPistolPayload[];
};

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

export const createStation = async (data: Partial<Station>): Promise<{ success: boolean; station: Station }> => {
  const response = await api.post<{ success: boolean; station: Station }>('/stations', data);
  return response.data;
};

export const updateStation = async (id: string, data: Partial<Station>): Promise<{ success: boolean; station: Station }> => {
  const response = await api.put<{ success: boolean; station: Station }>(`/stations/${id}`, data);
  return response.data;
};

export const deleteStation = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/stations/${id}`);
  return response.data;
};

// Tank API
export const fetchTanks = async (stationId?: string): Promise<{ success: boolean; tanks: Tank[] }> => {
  const response = await api.get<{ success: boolean; tanks: Tank[] }>('/tanks', {
    params: { station: stationId },
  });
  return response.data;
};

export const createTank = async (data: TankPayload): Promise<{ success: boolean; tank: Tank }> => {
  const response = await api.post<{ success: boolean; tank: Tank }>('/tanks', data);
  return response.data;
};

export const updateTank = async (id: string, data: Partial<TankPayload>): Promise<{ success: boolean; tank: Tank }> => {
  const response = await api.put<{ success: boolean; tank: Tank }>(`/tanks/${id}`, data);
  return response.data;
};

export const deleteTank = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/tanks/${id}`);
  return response.data;
};

// Pump API
export const fetchPumps = async (stationId?: string): Promise<{ success: boolean; pumps: Pump[] }> => {
  const response = await api.get<{ success: boolean; pumps: Pump[] }>('/pumps', {
    params: { station: stationId },
  });
  return response.data;
};

export const createPump = async (data: PumpPayload): Promise<{ success: boolean; pump: Pump }> => {
  const response = await api.post<{ success: boolean; pump: Pump }>('/pumps', data);
  return response.data;
};

export const updatePump = async (id: string, data: Partial<PumpPayload>): Promise<{ success: boolean; pump: Pump }> => {
  const response = await api.put<{ success: boolean; pump: Pump }>(`/pumps/${id}`, data);
  return response.data;
};

export const deletePump = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/pumps/${id}`);
  return response.data;
};
