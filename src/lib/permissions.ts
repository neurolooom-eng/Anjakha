import type { Permission } from '@/types'

export const PERMISSION_CATALOG: Permission[] = [
  { key: 'dashboard:view', label: 'View dashboard', module: 'Dashboard' },

  { key: 'patients:view', label: 'View patients & appointments', module: 'Patients' },
  { key: 'patients:create', label: 'Create patients & appointments', module: 'Patients' },
  { key: 'patients:edit', label: 'Edit patients & appointments', module: 'Patients' },

  { key: 'ipd:view', label: 'View admissions & beds', module: 'IPD' },
  { key: 'ipd:create', label: 'Create admissions', module: 'IPD' },
  { key: 'ipd:edit', label: 'Edit admissions & beds', module: 'IPD' },

  { key: 'clinical:view', label: 'View consultations & prescriptions', module: 'Clinical' },
  { key: 'clinical:create', label: 'Create consultations & prescriptions', module: 'Clinical' },
  { key: 'clinical:edit', label: 'Edit consultations & prescriptions', module: 'Clinical' },

  { key: 'pharmacy:view', label: 'View pharmacy', module: 'Pharmacy' },
  { key: 'pharmacy:create', label: 'Create pharmacy records', module: 'Pharmacy' },
  { key: 'pharmacy:edit', label: 'Edit pharmacy records', module: 'Pharmacy' },

  { key: 'billing:view', label: 'View invoices & payments', module: 'Billing' },
  { key: 'billing:create', label: 'Create invoices & payments', module: 'Billing' },
  { key: 'billing:edit', label: 'Edit invoices & payments', module: 'Billing' },

  { key: 'accounts:view', label: 'View books & ledgers', module: 'Accounts' },
  { key: 'accounts:create', label: 'Create journal entries', module: 'Accounts' },
  { key: 'accounts:edit', label: 'Edit chart of accounts', module: 'Accounts' },

  { key: 'gst:view', label: 'View GST filing', module: 'GST' },
  { key: 'gst:create', label: 'Generate GST returns', module: 'GST' },

  { key: 'insurance:view', label: 'View insurance & claims', module: 'Insurance' },
  { key: 'insurance:create', label: 'Create policies & claims', module: 'Insurance' },
  { key: 'insurance:edit', label: 'Edit policies & claims', module: 'Insurance' },

  { key: 'admin:access', label: 'Users & Access page', module: 'Admin' },
  { key: 'config:access', label: 'Developer Config page', module: 'Admin' },
]

export const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.map((p) => p.key)

export function permissionsByModule(): Record<string, Permission[]> {
  const map: Record<string, Permission[]> = {}
  for (const p of PERMISSION_CATALOG) {
    if (!map[p.module]) map[p.module] = []
    map[p.module].push(p)
  }
  return map
}
