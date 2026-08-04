import { AuditLog } from '../models/AuditLog';
import { Types } from 'mongoose';

export interface AuditLogPayload {
  user?: Types.ObjectId | string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'INFO';
  message?: string;
  metadata?: Record<string, any>;
}

export const logAuditEvent = async (payload: AuditLogPayload): Promise<void> => {
  try {
    await AuditLog.create(payload);
  } catch (error) {
    console.error('[AuditLog] Failed to save audit event', error);
  }
};
