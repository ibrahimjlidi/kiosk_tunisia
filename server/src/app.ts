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
import purchaseRoutes from './routes/purchase.routes';
import supplierRoutes from './routes/supplier.routes';
import expenseRoutes from './routes/expense.routes';
import reportRoutes from './routes/report.routes';
import purchaseOrderRoutes from './routes/purchaseOrder.routes';
import tankGaugingRoutes from './routes/tankGauging.routes';
import dailyClosureRoutes from './routes/dailyClosure.routes';
import kifReturnRoutes from './routes/kifReturn.routes';
import teamRoutes from './routes/team.routes';
import settingRoutes from './routes/setting.routes';
import auditLogRoutes from './routes/auditLog.routes';
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
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/tank-gaugings', tankGaugingRoutes);
app.use('/api/v1/daily-closures', dailyClosureRoutes);
app.use('/api/v1/kif-returns', kifReturnRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);

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
