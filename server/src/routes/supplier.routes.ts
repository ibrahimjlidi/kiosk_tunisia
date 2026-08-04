import { Router } from 'express';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplier.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createSupplier);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateSupplier);
router.delete('/:id', authorizeRoles('ADMIN'), deleteSupplier);

export default router;
