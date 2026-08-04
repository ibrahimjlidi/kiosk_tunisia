import { Router } from 'express';
import {
  getShifts,
  getShiftById,
  openShift,
  updateShiftReadings,
  updateShiftPayments,
  closeShift,
  reopenShift,
} from '../controllers/shift.controller';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('shifts.read'), getShifts);
router.get('/:id', authorize('shifts.read'), getShiftById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), authorize('shifts.manage'), openShift);
router.put('/:id/readings', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), authorize('shifts.manage'), updateShiftReadings);
router.put('/:id/payments', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), authorize('shifts.manage'), updateShiftPayments);
router.post('/:id/close', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), authorize('shifts.manage'), closeShift);
router.post('/:id/reopen', authorizeRoles('ADMIN'), authorize('shifts.manage'), reopenShift);

export default router;
