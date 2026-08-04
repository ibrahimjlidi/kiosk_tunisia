import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { analyticsSummaryReport, dailySalesReport, productSalesReport, shiftSalesReport } from '../controllers/salesReport.controller';
import { agingReport } from '../controllers/creditReport.controller';

const router = Router();

router.get('/sales/daily', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('reports.read'), dailySalesReport);
router.get('/sales/product', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('reports.read'), productSalesReport);
router.get('/sales/shift', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('reports.read'), shiftSalesReport);
router.get('/summary', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('reports.read'), analyticsSummaryReport);
router.get('/credits/aging', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('reports.read'), agingReport);

export default router;
