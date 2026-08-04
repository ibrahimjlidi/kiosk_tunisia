import { Request, Response } from 'express';
import { Station } from '../models/Station';
import { normalizeApiError } from '../helpers/errorResponse';

export const getAllStations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stations = await Station.find().populate('manager', 'firstName lastName email').sort({ name: 1 });
    res.status(200).json({ success: true, count: stations.length, stations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load stations.') });
  }
};

export const createStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json({ success: true, message: 'Station created successfully', station });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to create station.') });
  }
};

export const updateStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Station updated successfully', station });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to update station.') });
  }
};

export const deleteStation = async (req: Request, res: Response): Promise<void> => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) {
      res.status(404).json({ success: false, message: 'Station not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Station deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to delete station.') });
  }
};
