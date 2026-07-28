import { api } from './api';
import { LoginResponse, RegisterResponse, User } from '../types/auth';

export const loginUser = async (credentials: Record<string, string>): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: Record<string, any>): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', userData);
  return response.data;
};

export const fetchCurrentUser = async (): Promise<{ success: boolean; user: User }> => {
  const response = await api.get<{ success: boolean; user: User }>('/auth/me');
  return response.data;
};

export const fetchAllUsers = async (): Promise<{ success: boolean; users: User[] }> => {
  const response = await api.get<{ success: boolean; users: User[] }>('/users');
  return response.data;
};

export const updateUserRoleAndStatus = async (
  userId: string,
  data: { role?: string; active?: boolean }
): Promise<{ success: boolean; user: User }> => {
  const response = await api.put<{ success: boolean; user: User }>(`/users/${userId}`, data);
  return response.data;
};
