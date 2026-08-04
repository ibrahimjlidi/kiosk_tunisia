import { Router } from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate, authorize, authorizeRoles } from '../middlewares/auth.middleware';
import { productCreateValidator, productUpdateValidator } from '../validators/product.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize('products.read'), getAllProducts);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), authorize('products.manage'), productCreateValidator, createProduct);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), authorize('products.manage'), productUpdateValidator, updateProduct);
router.delete('/:id', authorizeRoles('ADMIN'), authorize('products.manage'), deleteProduct);

export default router;
