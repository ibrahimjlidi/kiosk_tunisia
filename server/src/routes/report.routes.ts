import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { dailySalesReport, productSalesReport, shiftSalesReport } from '../controllers/salesReport.controller';
import { agingReport } from '../controllers/creditReport.controller';

const router = Router();

router.get('/sales/daily', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), dailySalesReport);
router.get('/sales/product', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), productSalesReport);
router.get('/sales/shift', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), shiftSalesReport);
router.get('/credits/aging', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), agingReport);

export default router;
