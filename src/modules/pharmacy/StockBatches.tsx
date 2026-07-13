import { AlertTriangle, PackageSearch } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { KpiCard, KpiGrid } from '@/components/ui/KpiCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadDrugs, loadStockBatches, saveStockBatch, updateStockBatch, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { daysUntil, formatCurrency, formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { StockBatch } from '@/types'

const EXPIRY_WARNING_DAYS = 90

function expiryTone(days: number) {
  if (days < 0) return 'danger' as const
  if (days <= 30) return 'danger' as const
  if (days <= EXPIRY_WARNING_DAYS) return 'warning' as const
  return 'success' as const
}

const columns: DataTableColumn<StockBatch>[] = [
  { key: 'drugName', header: 'Drug', accessor: (r) => r.drugName, width: 200 },
  { key: 'batchNo', header: 'Batch', accessor: (r) => r.batchNo, width: 130, nowrap: true },
  { key: 'quantity', header: 'Qty', accessor: (r) => r.quantity, width: 90 },
  { key: 'purchaseRate', header: 'Purchase rate', accessor: (r) => r.purchaseRate, width: 120, render: (r) => formatCurrency(r.purchaseRate) },
  { key: 'mrp', header: 'MRP', accessor: (r) => r.mrp, width: 100, render: (r) => formatCurrency(r.mrp) },
  { key: 'supplierName', header: 'Supplier', accessor: (r) => r.supplierName, width: 180 },
  {
    key: 'expiryDate', header: 'Expiry', accessor: (r) => r.expiryDate, width: 160,
    render: (r) => {
      const days = daysUntil(r.expiryDate)
      const label = days < 0 ? 'Expired' : days <= EXPIRY_WARNING_DAYS ? `${formatDate(r.expiryDate)} (${days}d)` : formatDate(r.expiryDate)
      return <StatusChip value={label} tone={expiryTone(days)} />
    },
  },
]

export function StockBatchesTab() {
  const { data: batches, loading, setData } = useCollection(loadStockBatches)
  const { data: drugs } = useCollection(loadDrugs)
  const { currentUser } = useAuth()

  const drugOptions = drugs.map((d) => ({ value: d.id, label: d.name }))

  const qtyByDrug = new Map<string, number>()
  for (const b of batches) qtyByDrug.set(b.drugId, (qtyByDrug.get(b.drugId) ?? 0) + b.quantity)
  const lowStockDrugs = drugs.filter((d) => (qtyByDrug.get(d.id) ?? 0) < d.reorderLevel)
  const expiringSoon = batches.filter((b) => daysUntil(b.expiryDate) <= EXPIRY_WARNING_DAYS)

  const sections: FormSection[] = [
    {
      title: 'Batch details',
      fields: [
        {
          key: 'drugId', label: 'Drug', type: 'select', options: drugOptions, required: true,
        },
        { key: 'batchNo', label: 'Batch number', type: 'text', required: true },
        { key: 'expiryDate', label: 'Expiry date', type: 'date', required: true },
        { key: 'quantity', label: 'Quantity', type: 'number', required: true },
        { key: 'purchaseRate', label: 'Purchase rate', type: 'currency', required: true },
        { key: 'mrp', label: 'MRP', type: 'currency', required: true },
        { key: 'supplierName', label: 'Supplier', type: 'text', required: true },
      ],
    },
  ]

  function toFormValues(record: StockBatch | null): FormValues {
    if (record) return { ...record }
    return {}
  }

  function buildRecord(values: FormValues, editing: StockBatch | null): StockBatch {
    const drug = drugs.find((d) => d.id === values.drugId)
    const base = { ...editing, ...values, drugName: drug?.name ?? editing?.drugName ?? '' } as StockBatch
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as StockBatch
  }

  async function handleSave(record: StockBatch, editing: StockBatch | null) {
    if (editing) {
      await updateStockBatch(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveStockBatch(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <KpiGrid>
        <KpiCard label="Batches in stock" value={batches.length} icon={PackageSearch} />
        <KpiCard label="Low stock drugs" value={lowStockDrugs.length} icon={AlertTriangle} target={0} goal="lower" />
        <KpiCard label="Expiring ≤ 90 days" value={expiringSoon.length} icon={AlertTriangle} target={0} goal="lower" />
        <KpiCard label="Inventory value" value={batches.reduce((s, b) => s + b.quantity * b.purchaseRate, 0)} format="currency" icon={PackageSearch} />
      </KpiGrid>

      {lowStockDrugs.length > 0 && (
        <div className="card flex flex-wrap items-center gap-2 border-warning/40 bg-warning/5 p-3">
          <AlertTriangle size={16} className="shrink-0 text-warning" />
          <p className="text-sm text-text">
            <span className="font-medium">Low stock:</span>{' '}
            {lowStockDrugs.map((d) => d.name).join(', ')}
          </p>
        </div>
      )}

      <ResourceModule<StockBatch>
        tableKey="pharmacy-batches"
        title="Stock & Batches"
        description="Batch-wise inventory with expiry and low-stock tracking."
        icon={PackageSearch}
        columns={columns}
        rows={batches}
        permissionBase="pharmacy"
        newLabel="Add Batch"
        emptyMessage={loading ? 'Loading…' : 'No stock batches recorded.'}
        toFormValues={toFormValues}
        buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('stk') }, editing)}
        onSave={handleSave}
        renderForm={(values, setField) =>
          drugs.length === 0 ? (
            <EmptyState title="Add a drug first" message="Create at least one Drug Master entry before recording stock." />
          ) : (
            <SchemaForm sections={sections} values={values} onChange={setField} />
          )
        }
      />
    </div>
  )
}
