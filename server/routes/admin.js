import { Router } from 'express';
import { createOfficial, createOfficialValidators } from '../controllers/authController.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/officials', authenticate, requireSuperAdmin, createOfficialValidators, createOfficial);

export default router;
