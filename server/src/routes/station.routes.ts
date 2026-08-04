import { Router } from 'express';
import { getAllStations, createStation, updateStation, deleteStation } from '../controllers/station.controller';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { stationCreateValidator, stationUpdateValidator } from '../validators/station.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize('stations.read'), getAllStations);
router.post('/', authorizeRoles('ADMIN'), authorize('stations.manage'), stationCreateValidator, createStation);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), authorize('stations.manage'), stationUpdateValidator, updateStation);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('stations.manage'), deleteStation);

export default router;
