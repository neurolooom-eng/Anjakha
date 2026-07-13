import { BookText } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { LineItemsEditor, type LineItemColumn } from '@/components/form/LineItemsEditor'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadAccounts, loadJournalEntries, saveJournalEntry, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { JournalEntry, JournalLine, Tone } from '@/types'

const SOURCE_TONE: Record<string, Tone> = {
  Manual: 'neutral', Billing: 'info', 'Pharmacy Purchase': 'warning', 'Pharmacy Sale': 'success',
}

const columns: DataTableColumn<JournalEntry>[] = [
  { key: 'entryNumber', header: 'Entry #', accessor: (r) => r.entryNumber, width: 130, nowrap: true },
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'narration', header: 'Narration', accessor: (r) => r.narration, width: 280 },
  { key: 'source', header: 'Source', accessor: (r) => r.source, width: 140, render: (r) => <StatusChip value={r.source} tone={SOURCE_TONE[r.source]} /> },
  {
    key: 'amount', header: 'Amount', width: 120,
    accessor: (r) => r.lines.reduce((s, l) => s + l.debit, 0),
    render: (r) => formatCurrency(r.lines.reduce((s, l) => s + l.debit, 0)),
  },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusChip value={r.status} tone={r.status === 'Posted' ? 'success' : 'neutral'} /> },
]

export function JournalEntriesTab() {
  const { data: entries, loading, setData } = useCollection(loadJournalEntries)
  const { data: accounts } = useCollection(loadAccounts)
  const { currentUser } = useAuth()

  const accountOptions = accounts.map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }))

  const lineColumns: LineItemColumn<JournalLine>[] = [
    {
      key: 'accountId', label: 'Account', type: 'select', options: accountOptions, width: '40%',
      onSelect: (_row, value) => ({ accountName: accounts.find((a) => a.id === value)?.name ?? '' }),
    },
    { key: 'debit', label: 'Debit', type: 'number', width: '25%' },
    { key: 'credit', label: 'Credit', type: 'number', width: '25%' },
  ]

  const sections: FormSection[] = [
    {
      title: 'Journal entry',
      fields: [
        { key: 'entryNumber', label: 'Entry number', type: 'text', readonly: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'narration', label: 'Narration', type: 'text', required: true },
      ],
    },
  ]

  function toFormValues(): FormValues {
    return {
      entryNumber: `JE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().slice(0, 10),
      lines: [],
    }
  }

  function buildRecord(values: FormValues): JournalEntry {
    const base = {
      ...values, source: 'Manual', status: 'Posted', lines: (values.lines ?? []) as JournalLine[],
    } as JournalEntry
    return withAudit(base, currentUser?.name ?? 'system') as JournalEntry
  }

  function validate(values: FormValues) {
    const lines = (values.lines ?? []) as JournalLine[]
    const debit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
    const credit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
    if (lines.length < 2 || Math.abs(debit - credit) > 0.01) {
      return { lines: 'Debits and credits must balance across at least 2 lines.' }
    }
    return undefined
  }

  async function handleSave(record: JournalEntry) {
    await saveJournalEntry(record)
    setData((rows) => [record, ...rows])
  }

  return (
    <ResourceModule<JournalEntry>
      tableKey="accounts-journal"
      title="Journal Entries"
      description="Manual double-entry postings alongside auto-posted Billing and Pharmacy entries."
      icon={BookText}
      columns={columns}
      rows={entries}
      permissionBase="accounts"
      newLabel="New Entry"
      onRowClick={() => {}}
      emptyMessage={loading ? 'Loading…' : 'No journal entries yet.'}
      toFormValues={toFormValues}
      buildRecord={(values) => buildRecord({ ...values, id: makeId('je') })}
      onSave={handleSave}
      validate={validate}
      renderForm={(values, setField) => {
        const lines = (values.lines ?? []) as JournalLine[]
        const debit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
        const credit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
        return (
          <div className="flex flex-col gap-4">
            <SchemaForm sections={sections} values={values} onChange={setField} />
            <div>
              <p className="label">Lines</p>
              <LineItemsEditor<JournalLine>
                columns={lineColumns}
                rows={lines}
                onChange={(rows) => setField('lines', rows)}
                newRow={() => ({ accountId: '', accountName: '', debit: 0, credit: 0 })}
                addLabel="Add line"
              />
              <div className="mt-2 flex justify-end gap-4 text-sm">
                <span className="text-muted">Debit: <span className="font-semibold text-text">{formatCurrency(debit)}</span></span>
                <span className="text-muted">Credit: <span className="font-semibold text-text">{formatCurrency(credit)}</span></span>
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}
