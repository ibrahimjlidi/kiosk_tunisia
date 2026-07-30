import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { createPurchase, listPurchases } from '../controllers/purchase.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), listPurchases);
router.post('/', authorizeRoles('ADMIN','MANAGER'), createPurchase);

export default router;
