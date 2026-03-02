import AuditLog from '../models/AuditLog.js';

export async function logAction(action, performedBy, userId, details = {}) {
  await AuditLog.create({ action, performedBy, userId, details });
}
