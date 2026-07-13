import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { PatientRegistry } from './Registry'
import { AppointmentsTab } from './Appointments'
import { OpdQueueTab } from './OpdQueue'

const TABS = [
  { key: 'registry', label: 'Registry' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'queue', label: 'OPD Queue' },
]

export function PatientsPage() {
  const [tab, setTab] = useState('registry')

  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'registry' && <PatientRegistry />}
      {tab === 'appointments' && <AppointmentsTab />}
      {tab === 'queue' && <OpdQueueTab />}
    </div>
  )
}
