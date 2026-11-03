import { Request, Response } from 'express';
import { config } from '../config/env';
import { isDatabaseConnected } from '../config/db';

export const getHealthStatus = async (_req: Request, res: Response): Promise<void> => {
  const connected = isDatabaseConnected();

  res.status(200).json({
    success: true,
    message: 'FuelStation ERP API is running smoothly',
    system: {
      appName: 'FuelStation ERP',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: {
        status: connected ? 'Connected' : 'Disconnected',
        connected,
        host: config.database.host,
        name: config.database.name,
      },
    },
  });
};
