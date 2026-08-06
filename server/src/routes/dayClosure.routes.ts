import { Router } from 'express';
import { getDayClosure, closeDay, reopenDay } from '../controllers/dayClosure.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getDayClosure);
router.post('/close', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), closeDay);
router.post('/reopen', authorizeRoles('ADMIN'), reopenDay);

export default router;
