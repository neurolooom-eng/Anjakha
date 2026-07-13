import { Pill } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadDrugs, saveDrug, updateDrug, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Drug } from '@/types'

const GST_OPTIONS = [0, 5, 12, 18, 28].map((v) => ({ value: String(v), label: `${v}%` }))
const CATEGORY_OPTIONS = ['Analgesic', 'Antibiotic', 'Cardiac', 'Endocrine', 'IV Fluid', 'Consumable', 'General'].map((v) => ({ value: v, label: v }))
const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Drug>[] = [
  { key: 'name', header: 'Drug', accessor: (r) => r.name, width: 200 },
  { key: 'genericName', header: 'Generic name', accessor: (r) => r.genericName, width: 180 },
  { key: 'hsnCode', header: 'HSN', accessor: (r) => r.hsnCode, width: 100, nowrap: true },
  { key: 'category', header: 'Category', accessor: (r) => r.category, width: 130 },
  { key: 'gstRate', header: 'GST', accessor: (r) => r.gstRate, width: 70, render: (r) => `${r.gstRate}%` },
  { key: 'mrp', header: 'MRP', accessor: (r) => r.mrp, width: 100, render: (r) => formatCurrency(r.mrp) },
  { key: 'reorderLevel', header: 'Reorder at', accessor: (r) => r.reorderLevel, width: 100 },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusCell value={r.status} /> },
]

const sections: FormSection[] = [
  {
    title: 'Drug details',
    fields: [
      { key: 'name', label: 'Brand name', type: 'text', required: true },
      { key: 'genericName', label: 'Generic name', type: 'text', required: true },
      { key: 'hsnCode', label: 'HSN code', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS, required: true },
      { key: 'unit', label: 'Unit', type: 'text', placeholder: 'Tablet / Vial / Box', required: true },
    ],
  },
  {
    title: 'Pricing & stock policy',
    fields: [
      { key: 'mrp', label: 'MRP', type: 'currency', required: true },
      { key: 'gstRate', label: 'GST rate', type: 'select', options: GST_OPTIONS, required: true },
      { key: 'reorderLevel', label: 'Reorder level', type: 'number', required: true, help: 'Low-stock alert triggers below this quantity' },
      { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
    ],
  },
]

export function DrugMasterTab() {
  const { data: drugs, loading, setData } = useCollection(loadDrugs)
  const { currentUser } = useAuth()

  function toFormValues(record: Drug | null): FormValues {
    if (record) return { ...record, gstRate: String(record.gstRate) }
    return { status: 'Active', gstRate: '12' }
  }

  function buildRecord(values: FormValues, editing: Drug | null): Drug {
    const base = { ...editing, ...values, gstRate: Number(values.gstRate) } as Drug
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Drug
  }

  async function handleSave(record: Drug, editing: Drug | null) {
    if (editing) {
      await updateDrug(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveDrug(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Drug>
      tableKey="pharmacy-drugs"
      title="Drug Master"
      description="Formulary catalog with HSN, GST, and reorder policy."
      icon={Pill}
      columns={columns}
      rows={drugs}
      permissionBase="pharmacy"
      newLabel="Add Drug"
      emptyMessage={loading ? 'Loading…' : 'No drugs configured.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('drg') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
