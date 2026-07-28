import { Router } from 'express';
import { getAllPumps, createPump, updatePump, deletePump } from '../controllers/pump.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllPumps);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createPump);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updatePump);
router.delete('/:id', authorizeRoles('ADMIN'), deletePump);

export default router;
