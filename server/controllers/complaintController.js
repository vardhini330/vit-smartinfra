import Complaint from '../models/Complaint.js';
import InfrastructureAsset from '../models/InfrastructureAsset.js';
import { logAction } from '../utils/audit.js';
import { body, param, validationResult } from 'express-validator';
import { randomBytes } from 'crypto';
import path from 'path';

function generateComplaintId() {
  return 'CMP-' + randomBytes(4).toString('hex').toUpperCase();
}

export const createValidators = [
  body('assetId').isMongoId(),
  body('description').trim().notEmpty(),
];

export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const assetId = req.body.assetId;
    const asset = await InfrastructureAsset.findById(assetId);
    if (!asset) return res.status(404).json({ message: 'Asset not found' });

    const photos = [];
    if (req.files?.photos?.length) {
      req.files.photos.forEach((f) => photos.push(`/uploads/complaints/${path.basename(f.path)}`));
    }
    let voiceNoteUrl = null;
    if (req.files?.voiceNote?.[0]) {
      voiceNoteUrl = `/uploads/complaints/${path.basename(req.files.voiceNote[0].path)}`;
    }

    const complaint = await Complaint.create({
      complaintId: generateComplaintId(),
      assetId: asset._id,
      citizenId: req.user._id,
      citizenName: req.user.fullName,
      description: req.body.description,
      photos,
      voiceNoteUrl,
    });
    asset.complaintCount += 1;
    await asset.save();
    await logAction('Complaint raised', req.user.email, req.user._id, { complaintId: complaint.complaintId });
    res.status(201).json(complaint);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status } = req.query;
    const filter = req.user.role === 'citizen' ? { citizenId: req.user._id } : {};
    if (status) filter.status = status;
    const complaints = await Complaint.find(filter)
      .populate('assetId', 'assetId type location zone condition status')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('assetId');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (req.user.role === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(complaint);
  } catch (err) {
    next(err);
  }
}

export const updateStatusValidators = [
  param('id').isMongoId(),
  body('status').isIn(['Pending', 'In Progress', 'Resolved']),
];

export async function updateStatus(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    const previous = complaint.status;
    complaint.status = req.body.status;
    await complaint.save();
    await logAction(`Complaint status changed: ${previous} → ${complaint.status}`, req.user.email, req.user._id, {
      complaintId: complaint.complaintId,
    });
    res.json(complaint);
  } catch (err) {
    next(err);
  }
}

export const feedbackValidators = [
  param('id').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim(),
];

export async function submitFeedback(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Can only give feedback on resolved complaints' });
    }
    if (complaint.feedback?.submittedAt) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }
    complaint.feedback = {
      rating: req.body.rating,
      comment: req.body.comment || '',
      submittedAt: new Date(),
    };
    await complaint.save();
    await logAction('Feedback submitted', req.user.email, req.user._id, { complaintId: complaint.complaintId });
    res.json(complaint);
  } catch (err) {
    next(err);
  }
}
