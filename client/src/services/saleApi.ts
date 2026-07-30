import { api } from './api';

export const createSale = async (data: any) => {
  const res = await api.post('/sales', data);
  return res.data;
};

export const fetchSales = async (params?: any) => {
  const res = await api.get('/sales', { params });
  return res.data;
};
