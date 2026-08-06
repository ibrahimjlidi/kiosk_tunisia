import { Request, Response } from 'express';
import { DayClosure } from '../models/DayClosure';
import { Shift } from '../models/Shift';
import { AuthRequest } from '../middlewares/auth.middleware';

const normalizeDateRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getDayClosure = async (req: Request, res: Response): Promise<void> => {
  try {
    const { station, date } = req.query;
    if (!station || !date) {
      res.status(400).json({ success: false, message: 'station and date are required' });
      return;
    }

    const closureDate = new Date(date as string);
    const record = await DayClosure.findOne({ station, closureDate }).populate('closedBy', 'firstName lastName');

    res.status(200).json({ success: true, record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching day closure status' });
  }
};

export const closeDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { station, date, notes } = req.body;

    if (!station || !date) {
      res.status(400).json({ success: false, message: 'station and date are required' });
      return;
    }

    const closureDate = new Date(date);
    const { start, end } = normalizeDateRange(closureDate);

    const dayShifts = await Shift.find({
      station,
      shiftDate: { $gte: start, $lte: end },
    });

    if (dayShifts.some((shift) => shift.status === 'OPEN')) {
      res.status(400).json({ success: false, message: 'All shifts for this day must be closed before locking the day' });
      return;
    }

    const existing = await DayClosure.findOne({ station, closureDate });
    if (existing?.status === 'LOCKED') {
      res.status(409).json({ success: false, message: 'Day is already locked' });
      return;
    }

    const record = existing || new DayClosure({ station, closureDate });
    record.status = 'LOCKED';
    record.closedBy = req.user?.id as any;
    record.notes = notes || '';
    await record.save();

    res.status(200).json({ success: true, message: 'Day locked successfully', record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error locking day' });
  }
};

export const reopenDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { station, date, notes } = req.body;

    if (!station || !date) {
      res.status(400).json({ success: false, message: 'station and date are required' });
      return;
    }

    const closureDate = new Date(date);
    const record = await DayClosure.findOne({ station, closureDate });
    if (!record) {
      res.status(404).json({ success: false, message: 'No locked day record found for this station/date' });
      return;
    }

    if (record.status === 'OPEN') {
      res.status(409).json({ success: false, message: 'Day is already open' });
      return;
    }

    record.status = 'OPEN';
    record.reopenedBy = req.user?.id as any;
    record.notes = notes || record.notes || '';
    await record.save();

    res.status(200).json({ success: true, message: 'Day reopened successfully', record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error reopening day' });
  }
};
