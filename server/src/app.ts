import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import stationRoutes from './routes/station.routes';
import tankRoutes from './routes/tank.routes';
import pumpRoutes from './routes/pump.routes';
import customerRoutes from './routes/customer.routes';
import shiftRoutes from './routes/shift.routes';
import saleRoutes from './routes/sale.routes';
import reportRoutes from './routes/report.routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Middlewares
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/stations', stationRoutes);
app.use('/api/v1/tanks', tankRoutes);
app.use('/api/v1/pumps', pumpRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/reports', reportRoutes);

// 404 Handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Route Not Found',
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
