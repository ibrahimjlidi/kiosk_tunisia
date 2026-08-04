import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { listExpenses, addExpense, patchExpense } from '../controllers/expense.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('expenses.read'), listExpenses);
router.post('/', authorizeRoles('ADMIN','MANAGER'), authorize('expenses.manage'), addExpense);
router.patch('/:id', authorizeRoles('ADMIN','MANAGER'), authorize('expenses.manage'), patchExpense);

export default router;
