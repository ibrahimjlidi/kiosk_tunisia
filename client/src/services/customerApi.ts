import { api } from './api';
import { Customer, CreditTransaction, AgingBucket } from '../types/customer';

export const fetchCustomers = async (): Promise<{ success: boolean; customers: Customer[] }> => {
  const res = await api.get('/customers');
  return res.data;
};

export const createCustomer = async (data: Partial<Customer>): Promise<{ success: boolean; customer: Customer }> => {
  const res = await api.post('/customers', data);
  return res.data;
};

export const fetchCustomer = async (customerId: string): Promise<{ success: boolean; customer: Customer }> => {
  const res = await api.get(`/customers/${customerId}`);
  return res.data;
};

export const fetchCustomerTransactions = async (customerId: string): Promise<{ success: boolean; transactions: CreditTransaction[] }> => {
  const res = await api.get(`/customers/${customerId}/transactions`);
  return res.data;
};

export const addCustomerTransaction = async (customerId: string, data: Partial<CreditTransaction>) => {
  const res = await api.post(`/customers/${customerId}/transactions`, data);
  return res.data;
};

export const fetchCreditAging = async (station?: string): Promise<{ success: boolean; data: AgingBucket[] }> => {
  const res = await api.get('/reports/credits/aging', { params: station ? { station } : undefined });
  return res.data;
};
