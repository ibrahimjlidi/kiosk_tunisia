import { Router } from 'express';
import { getAllPumps, createPump, updatePump, deletePump } from '../controllers/pump.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { pumpCreateValidator, pumpUpdateValidator } from '../validators/pump.validator';

const router = Router();

router.use(authenticate);

router.get('/', getAllPumps);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), pumpCreateValidator, createPump);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), pumpUpdateValidator, updatePump);
router.delete('/:id', authorizeRoles('ADMIN'), deletePump);

export default router;
