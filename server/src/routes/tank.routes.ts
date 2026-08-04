import { Router } from 'express';
import { getAllTanks, createTank, updateTank, deleteTank } from '../controllers/tank.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { tankCreateValidator, tankUpdateValidator } from '../validators/tank.validator';

const router = Router();

router.use(authenticate);

router.get('/', getAllTanks);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), tankCreateValidator, createTank);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), tankUpdateValidator, updateTank);
router.delete('/:id', authorizeRoles('ADMIN'), deleteTank);

export default router;
