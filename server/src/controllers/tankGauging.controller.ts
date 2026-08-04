import { Request, Response } from 'express';
import { TankGauging } from '../models/TankGauging';
import { Tank } from '../models/Tank';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getAllGaugings = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};
    if (req.query.tank) filter.tank = req.query.tank;
    if (req.query.station) filter.station = req.query.station;

    const gaugings = await TankGauging.find(filter)
      .populate('tank', 'tankNumber capacity currentStock')
      .populate('station', 'name code')
      .populate('operator', 'firstName lastName')
      .sort({ gaugedAt: -1 });

    res.status(200).json({ success: true, count: gaugings.length, gaugings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching tank gaugings' });
  }
};

export const getGaugingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const gauging = await TankGauging.findById(req.params.id)
      .populate('tank', 'tankNumber capacity currentStock minLevelAlert')
      .populate('station', 'name code')
      .populate('operator', 'firstName lastName');

    if (!gauging) {
      res.status(404).json({ success: false, message: 'Tank gauging not found' });
      return;
    }
    res.status(200).json({ success: true, gauging });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching tank gauging' });
  }
};

export const createGauging = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tank, station, gaugedAt, dipReading, calculatedVolume, waterLevel, temperature, notes } = req.body;

    if (!tank || !station || dipReading === undefined || calculatedVolume === undefined) {
      res.status(400).json({ success: false, message: 'tank, station, dipReading, and calculatedVolume are required' });
      return;
    }

    // Get theoretical stock from Tank model
    const tankDoc = await Tank.findById(tank);
    if (!tankDoc) {
      res.status(404).json({ success: false, message: 'Tank not found' });
      return;
    }

    const theoreticalStock = tankDoc.currentStock;
    const variance = parseFloat((calculatedVolume - theoreticalStock).toFixed(3));

    const gauging = await TankGauging.create({
      tank,
      station,
      gaugedAt: gaugedAt || new Date(),
      dipReading,
      calculatedVolume,
      waterLevel: waterLevel || 0,
      temperature: temperature || 20,
      theoreticalStock,
      variance,
      operator: req.user!.id,
      notes,
    });

    res.status(201).json({ success: true, message: 'Tank gauging recorded successfully', gauging });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Error creating tank gauging' });
  }
};

export const deleteGauging = async (req: Request, res: Response): Promise<void> => {
  try {
    const gauging = await TankGauging.findByIdAndDelete(req.params.id);
    if (!gauging) {
      res.status(404).json({ success: false, message: 'Tank gauging not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Tank gauging deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting tank gauging' });
  }
};
