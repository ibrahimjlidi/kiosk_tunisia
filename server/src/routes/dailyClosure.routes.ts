import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { listDailyClosures, getDailyClosure, closeDailyClosure } from '../controllers/dailyClosure.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize('daily-closure.manage'), listDailyClosures);
router.get('/summary', authorize('daily-closure.manage'), getDailyClosure);
router.post('/close', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), authorize('daily-closure.manage'), closeDailyClosure);

export default router;
