import { Router } from 'express';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { createCustomer, listCustomers, getCustomer, addCreditTransaction, listCustomerTransactions } from '../controllers/customer.controller';
import { customerCreateValidator, customerTransactionValidator } from '../validators/customer.validator';

const router = Router();

router.post('/', authenticate, authorizeRoles('ADMIN','MANAGER'), authorize('customers.manage'), customerCreateValidator, createCustomer);
router.get('/', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('customers.read'), listCustomers);
router.get('/:id', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('customers.read'), getCustomer);
router.post('/:customerId/transactions', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('customers.manage'), customerTransactionValidator, addCreditTransaction);
router.get('/:customerId/transactions', authenticate, authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), authorize('customers.read'), listCustomerTransactions);

export default router;
