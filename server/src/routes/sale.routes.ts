import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { createSale, listSales, getSaleById } from '../controllers/sale.controller';

const router = Router();

// Public listing can be protected as needed
router.get('/', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), listSales);
router.get('/:id', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), getSaleById);
router.post('/', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR','OPERATOR'), createSale);

export default router;
