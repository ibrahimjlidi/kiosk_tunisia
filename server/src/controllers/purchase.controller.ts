import { Request, Response } from 'express';
import { recordProductPurchase, fetchProductPurchases } from '../services/purchase.service';

export const createPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const purchase = await recordProductPurchase(req.body);
    res.status(201).json({ success: true, message: 'Purchase recorded successfully', purchase });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error recording purchase' });
  }
};

export const listPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    const purchases = await fetchProductPurchases(req.query as any);
    res.status(200).json({ success: true, count: purchases.length, purchases });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching purchases' });
  }
};
