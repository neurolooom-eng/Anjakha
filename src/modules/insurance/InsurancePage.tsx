import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { InsurersTab } from './Insurers'
import { PoliciesTab } from './Policies'
import { ClaimsTab } from './Claims'

const TABS = [
  { key: 'claims', label: 'Pre-auth & Claims' },
  { key: 'policies', label: 'Patient Policies' },
  { key: 'insurers', label: 'Insurers & TPAs' },
]

export function InsurancePage() {
  const [tab, setTab] = useState('claims')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'claims' && <ClaimsTab />}
      {tab === 'policies' && <PoliciesTab />}
      {tab === 'insurers' && <InsurersTab />}
    </div>
  )
}
