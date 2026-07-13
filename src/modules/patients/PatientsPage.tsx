import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { PatientRegistry } from './Registry'
import { AppointmentsTab } from './Appointments'
import { OpdQueueTab } from './OpdQueue'
import { NurseStationTab } from './NurseStation'

const TABS = [
  { key: 'registry', label: 'Registry' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'queue', label: 'OPD Queue' },
  { key: 'nurse', label: "Nurse's Station" },
]

export function PatientsPage() {
  const [tab, setTab] = useState('registry')

  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'registry' && <PatientRegistry />}
      {tab === 'appointments' && <AppointmentsTab />}
      {tab === 'queue' && <OpdQueueTab />}
      {tab === 'nurse' && <NurseStationTab />}
    </div>
  )
}
