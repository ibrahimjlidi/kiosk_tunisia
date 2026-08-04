import { Router } from 'express';
import {
  getAllGaugings,
  getGaugingById,
  createGauging,
  deleteGauging,
} from '../controllers/tankGauging.controller';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('tanks.read'), getAllGaugings);
router.get('/:id', authorize('tanks.read'), getGaugingById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), authorize('tanks.manage'), createGauging);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('tanks.manage'), deleteGauging);

export default router;
