import { Router } from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('products.read'), getAllProducts);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), authorize('products.manage'), createProduct);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), authorize('products.manage'), updateProduct);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('products.manage'), deleteProduct);

export default router;
