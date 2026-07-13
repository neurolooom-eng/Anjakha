import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { InvoicesTab } from './Invoices'
import { PaymentsTab } from './Payments'

const TABS = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Payments' },
]

export function BillingPage() {
  const [tab, setTab] = useState('invoices')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'invoices' && <InvoicesTab />}
      {tab === 'payments' && <PaymentsTab />}
    </div>
  )
}
