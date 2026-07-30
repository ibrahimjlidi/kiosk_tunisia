import { Request, Response } from 'express';
import { aggregateSalesByDay, aggregateSalesByProduct, aggregateSalesByShift } from '../services/salesReport.service';

export const dailySalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end, station } = req.query;
    const data = await aggregateSalesByDay(start as string | undefined, end as string | undefined, station as string | undefined);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const productSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end, station } = req.query;
    const data = await aggregateSalesByProduct(start as string | undefined, end as string | undefined, station as string | undefined);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const shiftSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, station } = req.query;
    const data = await aggregateSalesByShift(date as string | undefined, station as string | undefined);
    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
