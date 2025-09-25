import { AuditLog } from '../models/AuditLog.js';

export async function audit(req, action, entity, entityId, metadata = {}) {
  try {
    await AuditLog.create({
      actorId: req?.user?.id,
      action,
      entity,
      entityId,
      metadata,
      ip: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (e) {
    // swallow audit errors
    if (process.env.NODE_ENV !== 'production') console.warn('Audit error', e.message);
  }
}
