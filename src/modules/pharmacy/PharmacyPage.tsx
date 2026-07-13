import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { DrugMasterTab } from './DrugMaster'
import { StockBatchesTab } from './StockBatches'
import { PurchasesTab } from './Purchases'
import { SalesTab } from './Sales'

const TABS = [
  { key: 'drugs', label: 'Drug Master' },
  { key: 'stock', label: 'Stock & Batches' },
  { key: 'purchases', label: 'Purchases (GRN)' },
  { key: 'sales', label: 'Sales & Dispensing' },
]

export function PharmacyPage() {
  const [tab, setTab] = useState('drugs')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'drugs' && <DrugMasterTab />}
      {tab === 'stock' && <StockBatchesTab />}
      {tab === 'purchases' && <PurchasesTab />}
      {tab === 'sales' && <SalesTab />}
    </div>
  )
}
