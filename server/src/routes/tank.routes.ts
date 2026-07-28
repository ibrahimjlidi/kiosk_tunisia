import { Router } from 'express';
import { getAllTanks, createTank, updateTank, deleteTank } from '../controllers/tank.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllTanks);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createTank);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateTank);
router.delete('/:id', authorizeRoles('ADMIN'), deleteTank);

export default router;
