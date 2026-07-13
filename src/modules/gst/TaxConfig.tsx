import { Percent } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadTaxRates, saveTaxRate, updateTaxRate, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { makeId } from '@/lib/id'
import type { TaxRate } from '@/types'

const CATEGORY_OPTIONS = ['Goods', 'Service'].map((v) => ({ value: v, label: v }))
const GST_OPTIONS = [0, 5, 12, 18, 28].map((v) => ({ value: String(v), label: `${v}%` }))

const columns: DataTableColumn<TaxRate>[] = [
  { key: 'hsnSacCode', header: 'HSN/SAC', accessor: (r) => r.hsnSacCode, width: 110, nowrap: true },
  { key: 'description', header: 'Description', accessor: (r) => r.description, width: 260 },
  { key: 'category', header: 'Category', accessor: (r) => r.category, width: 110, render: (r) => <StatusChip value={r.category} tone={r.category === 'Goods' ? 'info' : 'primary'} /> },
  { key: 'gstRate', header: 'GST rate', accessor: (r) => r.gstRate, width: 100, render: (r) => `${r.gstRate}%` },
]

const sections: FormSection[] = [
  {
    title: 'HSN / SAC mapping',
    fields: [
      { key: 'hsnSacCode', label: 'HSN/SAC code', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS, required: true },
      { key: 'gstRate', label: 'GST rate', type: 'select', options: GST_OPTIONS, required: true },
    ],
  },
]

export function TaxConfigTab() {
  const { data: rates, loading, setData } = useCollection(loadTaxRates)
  const { currentUser } = useAuth()

  function toFormValues(record: TaxRate | null): FormValues {
    if (record) return { ...record, gstRate: String(record.gstRate) }
    return { category: 'Goods', gstRate: '12' }
  }

  function buildRecord(values: FormValues, editing: TaxRate | null): TaxRate {
    const base = { ...editing, ...values, gstRate: Number(values.gstRate) } as TaxRate
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as TaxRate
  }

  async function handleSave(record: TaxRate, editing: TaxRate | null) {
    if (editing) {
      await updateTaxRate(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveTaxRate(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<TaxRate>
      tableKey="gst-tax-config"
      title="Tax / HSN Configuration"
      description="HSN & SAC codes mapped to GST rates, used across Pharmacy and Billing."
      icon={Percent}
      columns={columns}
      rows={rates}
      permissionBase="gst"
      newLabel="Add Mapping"
      emptyMessage={loading ? 'Loading…' : 'No HSN/SAC mappings configured.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('tax') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
