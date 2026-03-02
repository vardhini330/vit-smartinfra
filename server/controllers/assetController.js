import InfrastructureAsset from '../models/InfrastructureAsset.js';
import { logAction } from '../utils/audit.js';
import { body, param, validationResult } from 'express-validator';

export const createValidators = [
  body('assetId').trim().notEmpty(),
  body('type').isIn(['Road', 'Bridge', 'Streetlight', 'Water Supply', 'Hospital']),
  body('location').trim().notEmpty(),
  body('zone').trim().notEmpty(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).toFloat(),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).toFloat(),
  body('condition').isIn(['Good', 'Moderate', 'Poor']),
  body('lastMaintenanceDate').optional({ values: 'null' }).isISO8601().toDate(),
  body('status').isIn(['Active', 'Under Maintenance', 'Closed']),
];


export async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const asset = await InfrastructureAsset.create(req.body);
    await logAction('Asset created', req.user.email, req.user._id, { assetId: asset.assetId });
    res.status(201).json(asset);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'assetId already exists' });
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { zone, type } = req.query;
    const filter = {};
    if (zone) filter.zone = zone;
    if (type) filter.type = type;
    const assets = await InfrastructureAsset.find(filter).sort({ createdAt: -1 });
    res.json(assets);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const asset = await InfrastructureAsset.findOne({ assetId: req.params.assetId });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    res.json(asset);
  } catch (err) {
    next(err);
  }
}

export const updateValidators = [
  param('assetId').notEmpty(),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).toFloat(),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).toFloat(),
  body('condition').optional().isIn(['Good', 'Moderate', 'Poor']),
  body('lastMaintenanceDate').optional({ values: 'null' }).isISO8601().toDate(),
  body('status').optional().isIn(['Active', 'Under Maintenance', 'Closed']),
];

export async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const asset = await InfrastructureAsset.findOne({ assetId: req.params.assetId });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    const updates = {};
    if (req.body.latitude !== undefined) updates.latitude = req.body.latitude;
    if (req.body.longitude !== undefined) updates.longitude = req.body.longitude;
    if (req.body.condition != null) updates.condition = req.body.condition;
    if (req.body.lastMaintenanceDate !== undefined) updates.lastMaintenanceDate = req.body.lastMaintenanceDate;
    if (req.body.status != null) updates.status = req.body.status;
    Object.assign(asset, updates);
    await asset.save();
    await logAction('Asset updated', req.user.email, req.user._id, { assetId: asset.assetId });
    res.json(asset);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const asset = await InfrastructureAsset.findOneAndDelete({ assetId: req.params.assetId });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    await logAction('Asset deleted', req.user.email, req.user._id, { assetId: asset.assetId });
    res.json({ message: 'Asset deleted' });
  } catch (err) {
    next(err);
  }
}
