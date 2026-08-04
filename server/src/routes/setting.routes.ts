import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { getAllSettings, createSetting, updateSetting, deleteSetting } from '../controllers/setting.controller';

const router = Router();

router.use(authenticate);
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), authorize('users.read'), getAllSettings);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), authorize('users.manage'), createSetting);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), authorize('users.manage'), updateSetting);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('users.manage'), deleteSetting);

export default router;
