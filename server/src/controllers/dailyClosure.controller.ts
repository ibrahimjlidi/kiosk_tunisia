import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getDailyClosureSummary, getDailyClosures, finalizeDailyClosure } from '../services/dailyClosure.service';

export const listDailyClosures = async (req: Request, res: Response): Promise<void> => {
  try {
    const stationId = req.query.station as string | undefined;
    const closures = await getDailyClosures(stationId);
    res.status(200).json({ success: true, count: closures.length, closures });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to load daily closures' });
  }
};

export const getDailyClosure = async (req: Request, res: Response): Promise<void> => {
  try {
    const stationId = req.query.station as string | undefined;
    const date = req.query.date as string | undefined;
    const summary = await getDailyClosureSummary(stationId, date);
    res.status(200).json({ success: true, summary });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to load daily closure summary' });
  }
};

export const closeDailyClosure = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stationId, date, notes } = req.body;
    if (!stationId || !date) {
      res.status(400).json({ success: false, message: 'stationId and date are required' });
      return;
    }

    const closure = await finalizeDailyClosure({
      stationId,
      date,
      userId: req.user!.id,
      notes,
    });

    res.status(200).json({ success: true, message: 'Daily closure finalized', closure });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to finalize daily closure' });
  }
};
