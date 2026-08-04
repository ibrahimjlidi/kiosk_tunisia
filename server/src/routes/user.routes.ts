import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUserRole, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { updateUserValidator } from '../validators/user.validator';

const router = Router();

// Protect all routes
router.use(authenticate);

// Restricted to ADMIN & MANAGER for viewing, ADMIN for modifying
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), authorize('users.read'), getAllUsers);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), authorize('users.read'), getUserById);
router.post('/', authorizeRoles('ADMIN'), authorize('users.manage'), createUser);
router.put('/:id', authorizeRoles('ADMIN'), authorize('users.manage'), updateUserValidator, updateUserRole);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('users.manage'), deleteUser);

export default router;
