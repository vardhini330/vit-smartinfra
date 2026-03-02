import { Router } from 'express';
import { dashboard } from '../controllers/analyticsController.js';
import { authenticate, requireOfficial } from '../middleware/auth.js';

const router = Router();
router.get('/dashboard', authenticate, requireOfficial, dashboard);
export default router;
