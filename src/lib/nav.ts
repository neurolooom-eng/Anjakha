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
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' }],
  },
  {
    label: 'Front Office',
    items: [{ path: '/patients', label: 'Patients', icon: Users, permission: 'patients:view' }],
  },
  {
    label: 'Inpatient',
    items: [{ path: '/ipd', label: 'IPD', icon: BedDouble, permission: 'ipd:view' }],
  },
  {
    label: 'Clinical',
    items: [
      { path: '/clinical', label: 'Clinical', icon: Stethoscope, permission: 'clinical:view' },
      { path: '/doctors', label: 'Doctors', icon: IdCard, permission: 'doctors:view' },
    ],
  },
  {
    label: 'Pharmacy',
    items: [{ path: '/pharmacy', label: 'Pharmacy', icon: Pill, permission: 'pharmacy:view' }],
  },
  {
    label: 'Finance',
    items: [
      { path: '/billing', label: 'Billing', icon: Receipt, permission: 'billing:view' },
      { path: '/accounts', label: 'Books & Ledgers', icon: BookOpen, permission: 'accounts:view' },
      { path: '/gst', label: 'GST Filing', icon: Landmark, permission: 'gst:view' },
    ],
  },
  {
    label: 'Insurance',
    items: [{ path: '/insurance', label: 'Insurance', icon: ShieldCheck, permission: 'insurance:view' }],
  },
  {
    label: 'Admin',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
      { path: '/admin', label: 'Users & Access', icon: UserCog, permission: 'admin:access' },
      { path: '/config', label: 'Developer Config', icon: Wrench, permission: 'config:access' },
    ],
  },
]
