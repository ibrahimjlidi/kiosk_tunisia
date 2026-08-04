import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { listKifReturns, createKifReturn } from '../controllers/kifReturn.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize('kif-returns.manage'), listKifReturns);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), authorize('kif-returns.manage'), createKifReturn);

export default router;
