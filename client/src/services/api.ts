import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HealthResponse {
  success: boolean;
  message: string;
  system: {
    appName: string;
    environment: string;
    timestamp: string;
    database: {
      status: string;
      connected: boolean;
      host: string;
      name: string;
    };
  };
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
};
