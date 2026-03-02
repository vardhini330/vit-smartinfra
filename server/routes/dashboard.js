import { Router } from 'express';
import { dashboard } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.get('/stats', authenticate, dashboard);
export default router;
