import { Building } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadInsurers, saveInsurer, updateInsurer, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { makeId } from '@/lib/id'
import type { Insurer } from '@/types'

const TYPE_OPTIONS = ['Insurer', 'TPA'].map((v) => ({ value: v, label: v }))
const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Insurer>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name, width: 220 },
  { key: 'type', header: 'Type', accessor: (r) => r.type, width: 100, render: (r) => <StatusChip value={r.type} tone={r.type === 'TPA' ? 'info' : 'primary'} /> },
  { key: 'contactPerson', header: 'Contact', accessor: (r) => r.contactPerson ?? '', width: 160 },
  { key: 'phone', header: 'Phone', accessor: (r) => r.phone ?? '', width: 150, nowrap: true },
  { key: 'email', header: 'Email', accessor: (r) => r.email ?? '', width: 200 },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusChip value={r.status} tone={r.status === 'Active' ? 'success' : 'neutral'} /> },
]

const sections: FormSection[] = [
  {
    title: 'Insurer / TPA',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true },
      { key: 'contactPerson', label: 'Contact person', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
    ],
  },
]

export function InsurersTab() {
  const { data: insurers, loading, setData } = useCollection(loadInsurers)
  const { currentUser } = useAuth()

  function toFormValues(record: Insurer | null): FormValues {
    if (record) return { ...record }
    return { type: 'Insurer', status: 'Active' }
  }

  function buildRecord(values: FormValues, editing: Insurer | null): Insurer {
    const base = { ...editing, ...values } as Insurer
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Insurer
  }

  async function handleSave(record: Insurer, editing: Insurer | null) {
    if (editing) {
      await updateInsurer(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveInsurer(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Insurer>
      tableKey="insurance-insurers"
      title="Insurers & TPAs"
      description="Master list of insurance companies and third-party administrators."
      icon={Building}
      columns={columns}
      rows={insurers}
      permissionBase="insurance"
      newLabel="Add Insurer/TPA"
      emptyMessage={loading ? 'Loading…' : 'No insurers configured.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('ins') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
