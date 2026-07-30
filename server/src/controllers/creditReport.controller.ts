import { Request, Response } from 'express';
import { creditAgingReport } from '../services/creditReport.service';

export const agingReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { station } = req.query;
    const data = await creditAgingReport(station as string | undefined);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
