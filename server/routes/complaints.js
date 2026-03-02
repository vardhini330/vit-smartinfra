import { Router } from 'express';
import {
  create,
  createValidators,
  list,
  getById,
  updateStatus,
  updateStatusValidators,
  submitFeedback,
  feedbackValidators,
} from '../controllers/complaintController.js';
import { authenticate } from '../middleware/auth.js';
import { requireOfficial } from '../middleware/auth.js';
import { uploadComplaintFiles } from '../middleware/upload.js';

const router = Router();
router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.post('/', authenticate, uploadComplaintFiles, createValidators, create);
router.patch('/:id/status', authenticate, requireOfficial, updateStatusValidators, updateStatus);
router.post('/:id/feedback', authenticate, feedbackValidators, submitFeedback);
export default router;
