import { Router } from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllProducts);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createProduct);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), updateProduct);
router.delete('/:id', authorizeRoles('ADMIN'), deleteProduct);

export default router;
