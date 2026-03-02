import { Router } from 'express';
import {
  create,
  createValidators,
  list,
  getById,
  update,
  updateValidators,
  remove,
} from '../controllers/assetController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOfficial } from '../middleware/auth.js';

const router = Router();
router.get('/', authenticate, list);
router.get('/:assetId', authenticate, getById);
router.post('/', authenticate, requireOfficial, createValidators, create);
router.patch('/:assetId', authenticate, requireOfficial, updateValidators, update);
router.delete('/:assetId', authenticate, requireOfficial, remove);
export default router;
