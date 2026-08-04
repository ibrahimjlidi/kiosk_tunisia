import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { createCustomer, listCustomers, getCustomer, addCreditTransaction, listCustomerTransactions } from '../controllers/customer.controller';

const router = Router();

router.post('/', authenticate, authorizeRoles('ADMIN','MANAGER'), authorize('customers.manage'), createCustomer);
router.get('/', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('customers.read'), listCustomers);
router.get('/:id', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('customers.read'), getCustomer);
router.post('/:customerId/transactions', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('customers.manage'), addCreditTransaction);
router.get('/:customerId/transactions', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('customers.read'), listCustomerTransactions);

export default router;
