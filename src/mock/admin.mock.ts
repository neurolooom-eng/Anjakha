import type { Group, User } from '@/types'
import { ALL_PERMISSION_KEYS } from '@/lib/permissions'

const p = (...keys: string[]) => keys

export const mockGroups: Group[] = [
  { id: 'grp_admin', name: 'Administrator', permissions: ALL_PERMISSION_KEYS },
  {
    id: 'grp_doctor',
    name: 'Doctor',
    // A doctor's world is their own console & schedule. They deliberately do NOT get the
    // front-office patient lists (which expose every OPD patient), the doctor registry
    // (other doctors' personal details), or the cross-patient Clinical module. Their console
    // reads and writes consultations directly, and a patient's cross-doctor visit history
    // still surfaces inside that patient's own record when the doctor opens it.
    permissions: p('dashboard:view', 'doctors:self'),
  },
  {
    id: 'grp_nurse',
    name: 'Nurse',
    permissions: p('dashboard:view', 'patients:view', 'ipd:view', 'ipd:create', 'clinical:view', 'clinical:create'),
  },
  {
    id: 'grp_pharmacist',
    name: 'Pharmacist',
    permissions: p(
      'dashboard:view',
      'pharmacy:view',
      'pharmacy:create',
      'pharmacy:edit',
      'clinical:view',
    ),
  },
  {
    id: 'grp_frontdesk',
    name: 'Front Desk',
    permissions: p(
      'dashboard:view',
      'patients:view',
      'patients:create',
      'patients:edit',
      'billing:view',
      'billing:create',
      'insurance:view',
    ),
  },
  {
    id: 'grp_accountant',
    name: 'Accountant',
    permissions: p(
      'dashboard:view',
      'billing:view',
      'accounts:view',
      'accounts:create',
      'accounts:edit',
      'gst:view',
      'gst:create',
    ),
  },
  {
    id: 'grp_insurance',
    name: 'Insurance Desk',
    permissions: p(
      'dashboard:view',
      'patients:view',
      'billing:view',
      'insurance:view',
      'insurance:create',
      'insurance:edit',
    ),
  },
  {
    id: 'grp_developer',
    name: 'Developer',
    permissions: [...ALL_PERMISSION_KEYS.filter((k) => k.endsWith(':view')), 'config:access'],
  },
  {
    id: 'grp_viewer',
    name: 'Viewer',
    permissions: ALL_PERMISSION_KEYS.filter((k) => k.endsWith(':view')),
  },
]

export const mockUsers: User[] = [
  { id: 'usr_1', name: 'Anjali Sharma', email: 'anjali.sharma@anjakha.in', groupId: 'grp_admin', groupName: 'Administrator', status: 'Active' },
  { id: 'usr_2', name: 'Dr. Rohit Verma', email: 'rohit.verma@anjakha.in', groupId: 'grp_doctor', groupName: 'Doctor', status: 'Active', doctorId: 'doc_1' },
  { id: 'usr_3', name: 'Priya Nair', email: 'priya.nair@anjakha.in', groupId: 'grp_nurse', groupName: 'Nurse', status: 'Active' },
  { id: 'usr_4', name: 'Suresh Iyer', email: 'suresh.iyer@anjakha.in', groupId: 'grp_pharmacist', groupName: 'Pharmacist', status: 'Active' },
  { id: 'usr_5', name: 'Meena Joshi', email: 'meena.joshi@anjakha.in', groupId: 'grp_frontdesk', groupName: 'Front Desk', status: 'Active' },
  { id: 'usr_6', name: 'Karan Mehta', email: 'karan.mehta@anjakha.in', groupId: 'grp_accountant', groupName: 'Accountant', status: 'Active' },
  { id: 'usr_7', name: 'Fatima Sheikh', email: 'fatima.sheikh@anjakha.in', groupId: 'grp_insurance', groupName: 'Insurance Desk', status: 'Active' },
  { id: 'usr_8', name: 'Dev Ops', email: 'dev@anjakha.in', groupId: 'grp_developer', groupName: 'Developer', status: 'Active' },
]
