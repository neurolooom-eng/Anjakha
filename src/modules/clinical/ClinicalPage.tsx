import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { ConsultationsTab } from './Consultations'
import { PrescriptionsTab } from './Prescriptions'

const TABS = [
  { key: 'consultations', label: 'Consultations' },
  { key: 'prescriptions', label: 'Prescriptions' },
]

export function ClinicalPage() {
  const [tab, setTab] = useState('consultations')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'consultations' && <ConsultationsTab />}
      {tab === 'prescriptions' && <PrescriptionsTab />}
    </div>
  )
}
