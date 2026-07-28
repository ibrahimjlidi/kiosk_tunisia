import { api } from './api';
import { Shift, ShiftType } from '../types/shift';

export const fetchShifts = async (params?: {
  station?: string;
  date?: string;
  status?: string;
}): Promise<{ success: boolean; shifts: Shift[] }> => {
  const res = await api.get<{ success: boolean; shifts: Shift[] }>('/shifts', { params });
  return res.data;
};

export const fetchShiftById = async (id: string): Promise<{ success: boolean; shift: Shift }> => {
  const res = await api.get<{ success: boolean; shift: Shift }>(`/shifts/${id}`);
  return res.data;
};

export const openShift = async (data: {
  stationId: string;
  shiftType: ShiftType;
  shiftDate: string;
  employeeIds?: string[];
}): Promise<{ success: boolean; shift: Shift }> => {
  const res = await api.post<{ success: boolean; shift: Shift }>('/shifts', data);
  return res.data;
};

export const updateReadings = async (
  shiftId: string,
  readings: { pumpId: string; pistolId: string; closingIndex: number }[]
): Promise<{ success: boolean; shift: Shift }> => {
  const res = await api.put<{ success: boolean; shift: Shift }>(`/shifts/${shiftId}/readings`, { readings });
  return res.data;
};

export const updatePayments = async (
  shiftId: string,
  payments: {
    cashAmount: number;
    bankCardAmount: number;
    fuelCardAmount: number;
    bankTransferAmount: number;
    creditAmount: number;
  }
): Promise<{ success: boolean; shift: Shift }> => {
  const res = await api.put<{ success: boolean; shift: Shift }>(`/shifts/${shiftId}/payments`, payments);
  return res.data;
};

export const closeShift = async (
  shiftId: string,
  notes?: string
): Promise<{ success: boolean; shift: Shift }> => {
  const res = await api.post<{ success: boolean; shift: Shift }>(`/shifts/${shiftId}/close`, { notes });
  return res.data;
};

export const reopenShift = async (
  shiftId: string
): Promise<{ success: boolean; shift: Shift }> => {
  const res = await api.post<{ success: boolean; shift: Shift }>(`/shifts/${shiftId}/reopen`);
  return res.data;
};
