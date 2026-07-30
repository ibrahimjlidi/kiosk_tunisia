import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { listExpenses, addExpense, patchExpense } from '../controllers/expense.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), listExpenses);
router.post('/', authorizeRoles('ADMIN','MANAGER'), addExpense);
router.patch('/:id', authorizeRoles('ADMIN','MANAGER'), patchExpense);

export default router;
