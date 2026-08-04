import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { KifReturn } from '../models/KifReturn';

export const listKifReturns = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.station) filter.station = req.query.station;
    if (req.query.date) {
      const day = new Date(req.query.date as string);
      const start = new Date(day); start.setHours(0, 0, 0, 0);
      const end = new Date(day); end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await KifReturn.find(filter).populate('station', 'name code').populate('operator', 'firstName lastName').sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, kifReturns: records });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch Kif returns' });
  }
};

export const createKifReturn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stationId, productId, quantity, reason, notes, date } = req.body;
    if (!stationId || !quantity || !reason) {
      res.status(400).json({ success: false, message: 'stationId, quantity, and reason are required' });
      return;
    }

    const record = await KifReturn.create({
      station: stationId,
      product: productId,
      quantity,
      reason,
      notes,
      date: date ? new Date(date) : new Date(),
      operator: req.user!.id,
    });

    res.status(201).json({ success: true, message: 'Kif return recorded', kifReturn: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create Kif return' });
  }
};
