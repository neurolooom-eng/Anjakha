import type { LucideIcon } from 'lucide-react'
import {
  BedDouble, BookOpen, LayoutDashboard, Pill, Receipt, Settings, ShieldCheck, Stethoscope,
  UserCog, Users, Wrench, Landmark, IdCard,
} from 'lucide-react'

export interface NavItem {
  path: string
  label: string
  icon: LucideIcon
  permission?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
  /** Deprioritized modules outside the current OPD-only rollout — still fully functional,
   * just rendered muted and grouped last so OPD/My Console stay the obvious primary flow. */
  inProgress?: boolean
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' }],
  },
  {
    label: 'OPD',
    items: [{ path: '/patients', label: 'Patients', icon: Users, permission: 'patients:view' }],
  },
  {
    label: 'Doctors',
    items: [{ path: '/doctors', label: 'Doctors', icon: IdCard, permission: 'doctors:view' }],
  },
  {
    label: 'Admin',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
      { path: '/admin', label: 'Users & Access', icon: UserCog, permission: 'admin:access' },
      { path: '/config', label: 'Developer Config', icon: Wrench, permission: 'config:access' },
    ],
  },
  {
    label: 'In Progress',
    inProgress: true,
    items: [
      { path: '/ipd', label: 'IPD', icon: BedDouble, permission: 'ipd:view' },
      { path: '/clinical', label: 'Clinical', icon: Stethoscope, permission: 'clinical:view' },
      { path: '/pharmacy', label: 'Pharmacy', icon: Pill, permission: 'pharmacy:view' },
      { path: '/billing', label: 'Billing', icon: Receipt, permission: 'billing:view' },
      { path: '/accounts', label: 'Books & Ledgers', icon: BookOpen, permission: 'accounts:view' },
      { path: '/gst', label: 'GST Filing', icon: Landmark, permission: 'gst:view' },
      { path: '/insurance', label: 'Insurance', icon: ShieldCheck, permission: 'insurance:view' },
    ],
  },
]
