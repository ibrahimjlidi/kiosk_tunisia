import { api } from './api';

export const fetchSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const createSetting = async (data: any) => {
  const response = await api.post('/settings', data);
  return response.data;
};

export const updateSetting = async (id: string, data: any) => {
  const response = await api.put(`/settings/${id}`, data);
  return response.data;
};

export const deleteSetting = async (id: string) => {
  const response = await api.delete(`/settings/${id}`);
  return response.data;
};
