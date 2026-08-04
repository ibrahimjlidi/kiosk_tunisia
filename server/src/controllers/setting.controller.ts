import { Request, Response } from 'express';
import { Setting } from '../models/Setting';
import { normalizeApiError } from '../helpers/errorResponse';

export const getAllSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Setting.find().populate('updatedBy', 'firstName lastName').sort({ category: 1, key: 1 }).lean();
    res.status(200).json({ success: true, count: settings.length, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to load settings.') });
  }
};

export const createSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value, type, category, description, updatedBy } = req.body;
    if (!key) {
      res.status(400).json({ success: false, message: 'Setting key is required.' });
      return;
    }

    const setting = await Setting.create({
      key,
      value,
      type: type || 'string',
      category: category || 'general',
      description,
      updatedBy,
    });

    res.status(201).json({ success: true, message: 'Setting created successfully', setting });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to create setting.') });
  }
};

export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const setting = await Setting.findById(req.params.id);
    if (!setting) {
      res.status(404).json({ success: false, message: 'Setting not found.' });
      return;
    }

    const { key, value, type, category, description, updatedBy } = req.body;
    if (key) setting.key = key;
    if (value !== undefined) setting.value = value;
    if (type) setting.type = type;
    if (category) setting.category = category;
    if (description !== undefined) setting.description = description;
    if (updatedBy) setting.updatedBy = updatedBy;

    await setting.save();
    res.status(200).json({ success: true, message: 'Setting updated successfully', setting });
  } catch (error: any) {
    res.status(400).json({ success: false, message: normalizeApiError(error, 'Unable to update setting.') });
  }
};

export const deleteSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const setting = await Setting.findByIdAndDelete(req.params.id);
    if (!setting) {
      res.status(404).json({ success: false, message: 'Setting not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Setting deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: normalizeApiError(error, 'Unable to delete setting.') });
  }
};
