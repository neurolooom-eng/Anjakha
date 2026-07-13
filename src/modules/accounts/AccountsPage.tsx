import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { ChartOfAccountsTab } from './ChartOfAccounts'
import { JournalEntriesTab } from './JournalEntries'
import { LedgerTab } from './Ledger'
import { ReportsTab } from './Reports'

const TABS = [
  { key: 'chart', label: 'Chart of Accounts' },
  { key: 'journal', label: 'Journal Entries' },
  { key: 'ledger', label: 'General Ledger' },
  { key: 'reports', label: 'Reports' },
]

export function AccountsPage() {
  const [tab, setTab] = useState('chart')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'chart' && <ChartOfAccountsTab />}
      {tab === 'journal' && <JournalEntriesTab />}
      {tab === 'ledger' && <LedgerTab />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  )
}
