import { Landmark } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadAccounts, saveAccount, updateAccount, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Account, Tone } from '@/types'

const TYPE_OPTIONS = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'].map((v) => ({ value: v, label: v }))
const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))
const TYPE_TONE: Record<string, Tone> = { Asset: 'info', Liability: 'warning', Equity: 'primary', Income: 'success', Expense: 'danger' }

const columns: DataTableColumn<Account>[] = [
  { key: 'code', header: 'Code', accessor: (r) => r.code, width: 90, nowrap: true },
  { key: 'name', header: 'Account name', accessor: (r) => r.name, width: 220 },
  { key: 'type', header: 'Type', accessor: (r) => r.type, width: 120, render: (r) => <StatusChip value={r.type} tone={TYPE_TONE[r.type]} /> },
  { key: 'openingBalance', header: 'Opening balance', accessor: (r) => r.openingBalance, width: 140, render: (r) => formatCurrency(r.openingBalance) },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusChip value={r.status} tone={r.status === 'Active' ? 'success' : 'neutral'} /> },
]

const sections: FormSection[] = [
  {
    title: 'Account',
    fields: [
      { key: 'code', label: 'Account code', type: 'text', required: true },
      { key: 'name', label: 'Account name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true },
      { key: 'openingBalance', label: 'Opening balance', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
    ],
  },
]

export function ChartOfAccountsTab() {
  const { data: accounts, loading, setData } = useCollection(loadAccounts)
  const { currentUser } = useAuth()

  function toFormValues(record: Account | null): FormValues {
    if (record) return { ...record }
    return { type: 'Expense', status: 'Active', openingBalance: 0 }
  }

  function buildRecord(values: FormValues, editing: Account | null): Account {
    const base = { ...editing, ...values } as Account
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Account
  }

  async function handleSave(record: Account, editing: Account | null) {
    if (editing) {
      await updateAccount(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveAccount(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Account>
      tableKey="accounts-chart"
      title="Chart of Accounts"
      description="The account structure used across every journal entry."
      icon={Landmark}
      columns={columns}
      rows={accounts}
      permissionBase="accounts"
      newLabel="New Account"
      emptyMessage={loading ? 'Loading…' : 'No accounts configured.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('acc') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
