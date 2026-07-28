import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { loginValidator, registerValidator } from '../validators/auth.validator';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', authenticate, getMe);

export default router;
