import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { listAuditLogs } from '../controllers/auditLog.controller';

const router = Router();

router.use(authenticate);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), authorize('users.read'), listAuditLogs);

export default router;
