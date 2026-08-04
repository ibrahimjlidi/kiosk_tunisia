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
import {
  openShiftValidator,
  readingsUpdateValidator,
  paymentsUpdateValidator,
  closeShiftValidator,
} from '../validators/shift.validator';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorize('shifts.read'), getShifts);
router.get('/:id', authorize('shifts.read'), getShiftById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), authorize('shifts.manage'), openShiftValidator, openShift);
router.put('/:id/readings', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), authorize('shifts.manage'), readingsUpdateValidator, updateShiftReadings);
router.put('/:id/payments', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), authorize('shifts.manage'), paymentsUpdateValidator, updateShiftPayments);
router.post('/:id/close', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), authorize('shifts.manage'), closeShiftValidator, closeShift);
router.post('/:id/reopen', authorizeRoles('ADMIN'), authorize('shifts.manage'), reopenShift);

export default router;
