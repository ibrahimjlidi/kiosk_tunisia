import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { listSuppliers, addSupplier, editSupplier } from '../controllers/supplier.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorizeRoles('ADMIN','MANAGER','SUPERVISOR'), listSuppliers);
router.post('/', authorizeRoles('ADMIN','MANAGER'), addSupplier);
router.put('/:id', authorizeRoles('ADMIN','MANAGER'), editSupplier);

export default router;
