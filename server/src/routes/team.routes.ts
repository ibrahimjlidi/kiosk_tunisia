import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '../controllers/team.controller';

const router = Router();

router.use(authenticate);
router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), authorize('users.read'), getAllTeams);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), authorize('users.manage'), createTeam);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), authorize('users.manage'), updateTeam);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('users.manage'), deleteTeam);

export default router;
