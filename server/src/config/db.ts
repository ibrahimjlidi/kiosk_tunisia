import mongoose from 'mongoose';
import { config } from './env';
import { seedAdminUser } from '../utils/seedAdmin';
import { seedStationData } from '../utils/seedStationData';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    await seedAdminUser();
    await seedStationData();
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to local MongoDB at ${config.mongoUri}: ${(error as Error).message}`);
    console.warn(`[MongoDB Notice] ERP API will automatically retry connecting every 5 seconds...`);
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[MongoDB Warning] Lost connection to database. Attempting reconnect...');
  setTimeout(connectDB, 5000);
});
