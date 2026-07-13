import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { DoctorRegistryTab } from './Registry'
import { ConsultationSchedulesTab } from './ConsultationSchedules'
import { MyScheduleTab } from './MySchedule'
import { MyConsoleTab } from './MyConsole'

const TABS = [
  { key: 'console', label: 'My Console' },
  { key: 'myschedule', label: 'My Schedule' },
  { key: 'registry', label: 'Registry' },
  { key: 'schedules', label: 'Consultation Schedules' },
]

export function DoctorsPage() {
  const [tab, setTab] = useState('console')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'console' && <MyConsoleTab />}
      {tab === 'myschedule' && <MyScheduleTab />}
      {tab === 'registry' && <DoctorRegistryTab />}
      {tab === 'schedules' && <ConsultationSchedulesTab />}
    </div>
  )
}
