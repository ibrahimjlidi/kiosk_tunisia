import { Router } from 'express';
import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  deliverPurchaseOrder,
  cancelPurchaseOrder,
} from '../controllers/purchaseOrder.controller';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('purchases.read'), getAllPurchaseOrders);
router.get('/:id', authorize('purchases.read'), getPurchaseOrderById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), authorize('purchases.manage'), createPurchaseOrder);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), authorize('purchases.manage'), updatePurchaseOrder);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('purchases.manage'), deletePurchaseOrder);
router.put('/:id/deliver', authorizeRoles('ADMIN', 'MANAGER'), authorize('purchases.manage'), deliverPurchaseOrder);
router.put('/:id/cancel', authorizeRoles('ADMIN', 'MANAGER'), authorize('purchases.manage'), cancelPurchaseOrder);

export default router;
