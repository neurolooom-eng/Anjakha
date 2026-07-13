import type { AuditFields } from '@/types'

export function seedAudit(daysAgo = 0, by = 'system'): AuditFields {
  const date = new Date(Date.now() - daysAgo * 86400000).toISOString()
  return { createdAt: date, createdBy: by, updatedAt: date, updatedBy: by }
}
