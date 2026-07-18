import { createHashRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequirePermission } from '@/components/layout/RequirePermission'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { PatientRegistry } from '@/modules/patients/Registry'
import { AppointmentsTab } from '@/modules/patients/Appointments'
import { OpdQueueTab } from '@/modules/patients/OpdQueue'
import { NurseStationTab } from '@/modules/patients/NurseStation'
import { IpdPage } from '@/modules/ipd/IpdPage'
import { ClinicalPage } from '@/modules/clinical/ClinicalPage'
import { MyConsoleTab } from '@/modules/doctors/MyConsole'
import { MyScheduleTab } from '@/modules/doctors/MySchedule'
import { DoctorRegistryTab } from '@/modules/doctors/Registry'
import { ConsultationSchedulesTab } from '@/modules/doctors/ConsultationSchedules'
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
      { path: 'patients', element: <Navigate to="/patients/registry" replace /> },
      { path: 'patients/registry', element: <RequirePermission permission="patients:view"><PatientRegistry /></RequirePermission> },
      { path: 'patients/appointments', element: <RequirePermission permission="patients:view"><AppointmentsTab /></RequirePermission> },
      { path: 'patients/queue', element: <RequirePermission permission="patients:view"><OpdQueueTab /></RequirePermission> },
      { path: 'patients/nurse-station', element: <RequirePermission permission="patients:view"><NurseStationTab /></RequirePermission> },
      { path: 'ipd', element: <RequirePermission permission="ipd:view"><IpdPage /></RequirePermission> },
      { path: 'clinical', element: <RequirePermission permission="clinical:view"><ClinicalPage /></RequirePermission> },
      { path: 'doctors', element: <Navigate to="/doctors/console" replace /> },
      { path: 'doctors/console', element: <RequirePermission permission="doctors:self"><MyConsoleTab /></RequirePermission> },
      { path: 'doctors/my-schedule', element: <RequirePermission permission="doctors:self"><MyScheduleTab /></RequirePermission> },
      { path: 'doctors/registry', element: <RequirePermission permission="doctors:view"><DoctorRegistryTab /></RequirePermission> },
      { path: 'doctors/schedules', element: <RequirePermission permission="doctors:view"><ConsultationSchedulesTab /></RequirePermission> },
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
