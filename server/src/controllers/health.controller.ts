import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const getHealthStatus = async (_req: Request, res: Response): Promise<void> => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  res.status(200).json({
    success: true,
    message: 'FuelStation ERP API is running smoothly',
    system: {
      appName: 'FuelStation ERP',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatusMap[dbState] || 'Unknown',
        connected: dbState === 1,
        host: mongoose.connection.host || '127.0.0.1',
        name: mongoose.connection.name || 'fuelstation_erp',
      },
    },
  });
};
