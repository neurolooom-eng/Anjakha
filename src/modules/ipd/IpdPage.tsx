import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { AdmissionsTab } from './Admissions'
import { WardsBedsTab } from './WardsBeds'

const TABS = [
  { key: 'admissions', label: 'Admissions' },
  { key: 'beds', label: 'Wards & Beds' },
]

export function IpdPage() {
  const [tab, setTab] = useState('admissions')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'admissions' && <AdmissionsTab />}
      {tab === 'beds' && <WardsBedsTab />}
    </div>
  )
}
