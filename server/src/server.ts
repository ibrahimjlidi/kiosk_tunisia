import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`⛽ FuelStation ERP Backend Server Running`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 URL: http://localhost:${config.port}/api/v1`);
    console.log(`====================================================`);
  });
};

startServer();
