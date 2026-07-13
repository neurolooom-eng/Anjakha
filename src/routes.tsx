import { createHashRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequirePermission } from '@/components/layout/RequirePermission'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { PatientsPage } from '@/modules/patients/PatientsPage'
import { IpdPage } from '@/modules/ipd/IpdPage'
import { ClinicalPage } from '@/modules/clinical/ClinicalPage'
import { PharmacyPage } from '@/modules/pharmacy/PharmacyPage'
import { BillingPage } from '@/modules/billing/BillingPage'
import { AccountsPage } from '@/modules/accounts/AccountsPage'
import { GstPage } from '@/modules/gst/GstPage'
import { InsurancePage } from '@/modules/insurance/InsurancePage'
import { AdminPage } from '@/modules/admin/AdminPage'
import { SettingsPage } from '@/modules/settings/SettingsPage'
import { ConfigPage } from '@/modules/config/ConfigPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <RequirePermission permission="dashboard:view"><DashboardPage /></RequirePermission> },
      { path: 'patients', element: <RequirePermission permission="patients:view"><PatientsPage /></RequirePermission> },
      { path: 'ipd', element: <RequirePermission permission="ipd:view"><IpdPage /></RequirePermission> },
      { path: 'clinical', element: <RequirePermission permission="clinical:view"><ClinicalPage /></RequirePermission> },
      { path: 'pharmacy', element: <RequirePermission permission="pharmacy:view"><PharmacyPage /></RequirePermission> },
      { path: 'billing', element: <RequirePermission permission="billing:view"><BillingPage /></RequirePermission> },
      { path: 'accounts', element: <RequirePermission permission="accounts:view"><AccountsPage /></RequirePermission> },
      { path: 'gst', element: <RequirePermission permission="gst:view"><GstPage /></RequirePermission> },
      { path: 'insurance', element: <RequirePermission permission="insurance:view"><InsurancePage /></RequirePermission> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'admin', element: <RequirePermission permission="admin:access"><AdminPage /></RequirePermission> },
      { path: 'config', element: <RequirePermission permission="config:access"><ConfigPage /></RequirePermission> },
    ],
  },
])
