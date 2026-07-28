import { Router } from 'express';
import { getAllUsers, getUserById, updateUserRole, deleteUser } from '../controllers/user.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

// Restricted to ADMIN & MANAGER for viewing, ADMIN for modifying
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), getAllUsers);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), getUserById);
router.put('/:id', authorizeRoles('ADMIN'), updateUserRole);
router.delete('/:id', authorizeRoles('ADMIN'), deleteUser);

export default router;
