import { Router } from 'express';
import { list } from '../controllers/auditController.js';
import { authenticate, requireOfficial } from '../middleware/auth.js';

const router = Router();
router.get('/', authenticate, requireOfficial, list);
export default router;
