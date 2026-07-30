import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { createCustomer, listCustomers, getCustomer, addCreditTransaction, listCustomerTransactions } from '../controllers/customer.controller';

const router = Router();

router.post('/', authenticate, authorizeRoles('ADMIN','MANAGER'), createCustomer);
router.get('/', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), listCustomers);
router.get('/:id', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), getCustomer);
router.post('/:customerId/transactions', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), addCreditTransaction);
router.get('/:customerId/transactions', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), listCustomerTransactions);

export default router;
