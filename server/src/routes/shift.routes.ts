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
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/',                                   getShifts);
router.get('/:id',                                getShiftById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), openShift);
router.put('/:id/readings', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), updateShiftReadings);
router.put('/:id/payments', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), updateShiftPayments);
router.post('/:id/close',   authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), closeShift);
router.post('/:id/reopen',  authorizeRoles('ADMIN'), reopenShift);

export default router;
