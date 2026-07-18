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
import { DRUG_FORMS, drugLabel, isLiquidForm } from '@/lib/pharmacy'
import type { Drug, DrugForm } from '@/types'

const GST_OPTIONS = [0, 5, 12, 18, 28].map((v) => ({ value: String(v), label: `${v}%` }))
const FORM_OPTIONS = DRUG_FORMS.map((v) => ({ value: v, label: v }))
const CATEGORY_OPTIONS = ['Analgesic', 'Antibiotic', 'Cardiac', 'Endocrine', 'Respiratory', 'IV Fluid', 'Consumable', 'General'].map((v) => ({ value: v, label: v }))
const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Drug>[] = [
  { key: 'label', header: 'Medicine', accessor: (r) => drugLabel(r), width: 240 },
  { key: 'genericName', header: 'Generic name', accessor: (r) => r.genericName, width: 170 },
  { key: 'form', header: 'Form', accessor: (r) => r.form, width: 110 },
  { key: 'strength', header: 'Strength', accessor: (r) => r.strength, width: 120, nowrap: true },
  { key: 'category', header: 'Category', accessor: (r) => r.category, width: 120 },
  { key: 'gstRate', header: 'GST', accessor: (r) => r.gstRate, width: 70, render: (r) => `${r.gstRate}%` },
  { key: 'mrp', header: 'MRP', accessor: (r) => r.mrp, width: 90, render: (r) => formatCurrency(r.mrp) },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusCell value={r.status} /> },
]

export function DrugMasterTab() {
  const { data: drugs, loading, setData } = useCollection(loadDrugs)
  const { currentUser } = useAuth()

  function sectionsFor(values: FormValues): FormSection[] {
    const liquid = isLiquidForm(values.form as DrugForm | undefined)
    return [
      {
        title: 'Medicine details',
        fields: [
          { key: 'name', label: 'Medicine / brand name', type: 'text', required: true, placeholder: 'e.g. Atorvastatin' },
          { key: 'genericName', label: 'Generic name', type: 'text', required: true },
          { key: 'form', label: 'Form', type: 'select', options: FORM_OPTIONS, required: true },
          { key: 'strength', label: 'Strength', type: 'text', required: true, placeholder: liquid ? 'e.g. 125 mg/5 ml' : 'e.g. 500 mg' },
          ...(liquid ? [{ key: 'doseUnit', label: 'Measure unit', type: 'text' as const, placeholder: 'ml', help: 'Unit the doctor doses in, e.g. ml' }] : []),
          { key: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS, required: true },
          { key: 'unit', label: 'Dispensing pack unit', type: 'text', placeholder: 'Strip / Bottle / Vial / Box', required: true },
          { key: 'hsnCode', label: 'HSN code', type: 'text', required: true },
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
  }

  function toFormValues(record: Drug | null): FormValues {
    if (record) return { ...record, gstRate: String(record.gstRate) }
    return { status: 'Active', gstRate: '12', form: 'Tablet' }
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
      description="Formulary catalog with dosage form, strength, HSN, GST, and reorder policy. The consolidated medicine name is what appears on prescriptions."
      icon={Pill}
      columns={columns}
      rows={drugs}
      permissionBase="pharmacy"
      newLabel="Add Medicine"
      emptyMessage={loading ? 'Loading…' : 'No medicines configured.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('drg') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <div className="flex flex-col gap-3">
          <SchemaForm sections={sectionsFor(values)} values={values} onChange={setField} />
          {(values.name || values.strength) && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
              <span className="text-xs uppercase tracking-wide text-muted">Appears on prescription as</span>
              <p className="font-semibold text-text">
                {drugLabel({ name: values.name ?? '', strength: values.strength ?? '', form: (values.form as DrugForm) ?? 'Tablet' })}
              </p>
            </div>
          )}
        </div>
      )}
    />
  )
}
