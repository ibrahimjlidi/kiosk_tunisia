import { AuditLog } from '../models/AuditLog';

export interface AuditLogPayload {
  user?: string;
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
