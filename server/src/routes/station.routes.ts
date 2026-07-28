import { Router } from 'express';
import { getAllStations, createStation, updateStation, deleteStation } from '../controllers/station.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllStations);
router.post('/', authorizeRoles('ADMIN'), createStation);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateStation);
router.delete('/:id', authorizeRoles('ADMIN'), deleteStation);

export default router;
