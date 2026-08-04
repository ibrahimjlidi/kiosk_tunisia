import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { createSale, listSales, getSaleById } from '../controllers/sale.controller';

const router = Router();

// Public listing can be protected as needed
router.get('/', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('sales.read'), listSales);
router.get('/:id', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('sales.read'), getSaleById);
router.post('/', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR','OPERATOR'), authorize('sales.manage'), createSale);

export default router;
