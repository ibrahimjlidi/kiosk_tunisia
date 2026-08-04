import { Request, Response } from 'express';
import { Pump } from '../models/Pump';
import { normalizeApiError } from '../helpers/errorResponse';

export const getAllPumps = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.station) filter.station = req.query.station;

    const pumps = await Pump.find(filter)
      .populate('station', 'name code')
      .populate('pistols.product', 'name code category purchasePrice sellingPrice vatRate')
      .sort({ pumpNumber: 1 });

    res.status(200).json({ success: true, count: pumps.length, pumps });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load pumps.') });
  }
};

export const createPump = async (req: Request, res: Response): Promise<void> => {
  try {
    const pump = await Pump.create(req.body);
    res.status(201).json({ success: true, message: 'Pump created successfully', pump });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to create pump.') });
  }
};

export const updatePump = async (req: Request, res: Response): Promise<void> => {
  try {
    const pump = await Pump.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pump) {
      res.status(404).json({ success: false, message: 'Pump not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Pump updated successfully', pump });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to update pump.') });
  }
};

export const deletePump = async (req: Request, res: Response): Promise<void> => {
  try {
    const pump = await Pump.findByIdAndDelete(req.params.id);
    if (!pump) {
      res.status(404).json({ success: false, message: 'Pump not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Pump deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to delete pump.') });
  }
};
