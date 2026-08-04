import { Request, Response } from 'express';
import { Tank } from '../models/Tank';
import { normalizeApiError } from '../helpers/errorResponse';

export const getAllTanks = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.station) filter.station = req.query.station;

    const tanks = await Tank.find(filter)
      .populate('station', 'name code')
      .populate('product', 'name code category purchasePrice sellingPrice')
      .sort({ tankNumber: 1 });

    res.status(200).json({ success: true, count: tanks.length, tanks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load tanks.') });
  }
};

export const createTank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { capacity, currentStock, minLevelAlert } = req.body;
    if (currentStock > capacity) {
      res.status(400).json({ success: false, message: 'Current stock cannot exceed tank capacity.' });
      return;
    }
    if (minLevelAlert > capacity) {
      res.status(400).json({ success: false, message: 'Minimum alert level cannot exceed tank capacity.' });
      return;
    }

    const tank = await Tank.create(req.body);
    res.status(201).json({ success: true, message: 'Tank created successfully', tank });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to create tank.') });
  }
};

export const updateTank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { capacity, currentStock, minLevelAlert } = req.body;
    if (capacity !== undefined && currentStock !== undefined && currentStock > capacity) {
      res.status(400).json({ success: false, message: 'Current stock cannot exceed tank capacity.' });
      return;
    }
    if (capacity !== undefined && minLevelAlert !== undefined && minLevelAlert > capacity) {
      res.status(400).json({ success: false, message: 'Minimum alert level cannot exceed tank capacity.' });
      return;
    }

    const tank = await Tank.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tank) {
      res.status(404).json({ success: false, message: 'Tank not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Tank updated successfully', tank });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to update tank.') });
  }
};

export const deleteTank = async (req: Request, res: Response): Promise<void> => {
  try {
    const tank = await Tank.findByIdAndDelete(req.params.id);
    if (!tank) {
      res.status(404).json({ success: false, message: 'Tank not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Tank deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to delete tank.') });
  }
};
