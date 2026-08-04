import { Router } from 'express';
import { getAllStations, createStation, updateStation, deleteStation } from '../controllers/station.controller';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('stations.read'), getAllStations);
router.post('/', authorizeRoles('ADMIN'), authorize('stations.manage'), createStation);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), authorize('stations.manage'), updateStation);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('stations.manage'), deleteStation);

export default router;
