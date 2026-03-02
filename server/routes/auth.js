import { Router } from 'express';
import { register, registerValidators, login, loginValidators, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);
router.get('/me', authenticate, me);
export default router;
