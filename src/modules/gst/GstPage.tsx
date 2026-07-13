import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { TaxConfigTab } from './TaxConfig'
import { ReturnsTab } from './Returns'

const TABS = [
  { key: 'returns', label: 'GST Returns' },
  { key: 'config', label: 'Tax / HSN Config' },
]

export function GstPage() {
  const [tab, setTab] = useState('returns')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'returns' && <ReturnsTab />}
      {tab === 'config' && <TaxConfigTab />}
    </div>
  )
}
