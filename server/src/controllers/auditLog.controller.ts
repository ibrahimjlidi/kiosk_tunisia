import { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { normalizeApiError } from '../helpers/errorResponse';

export const listAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, status, action } = req.query;
    const filter: any = {};

    if (user) filter.user = user;
    if (status) filter.status = status;
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load audit logs.') });
  }
};
