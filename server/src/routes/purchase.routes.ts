import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { createPurchase, listPurchases } from '../controllers/purchase.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), authorize('purchases.read'), listPurchases);
router.post('/', authorizeRoles('ADMIN','MANAGER'), createPurchase);

export default router;
