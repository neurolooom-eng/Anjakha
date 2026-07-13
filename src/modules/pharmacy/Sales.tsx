import { ShoppingBag } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { LineItemsEditor, type LineItemColumn } from '@/components/form/LineItemsEditor'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import {
  loadDrugs, loadPatients, loadPharmacySales, loadPrescriptions, loadStockBatches, savePharmacySale,
  updatePharmacySale, updatePrescription, updateStockBatch, withAudit,
} from '@/lib/repository'
import { postPharmacySaleToLedger } from '@/lib/postings'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { PharmacySale, PharmacySaleItem, Prescription } from '@/types'

const STATUS_OPTIONS = ['Pending', 'Dispensed', 'Cancelled'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<PharmacySale>[] = [
  { key: 'invoiceNumber', header: 'Invoice #', accessor: (r) => r.invoiceNumber, width: 140, nowrap: true },
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 180 },
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'items', header: 'Items', accessor: (r) => r.items.length, width: 80 },
  { key: 'totalAmount', header: 'Amount', accessor: (r) => r.totalAmount, width: 120, render: (r) => formatCurrency(r.totalAmount) },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 120, render: (r) => <StatusCell value={r.status} /> },
]

function computeTotal(items: PharmacySaleItem[]) {
  return items.reduce((sum, i) => sum + i.quantity * i.rate * (1 + i.gstRate / 100), 0)
}

function itemsFromPrescription(rx: Prescription, drugs: { id: string; gstRate: number; mrp: number }[]): PharmacySaleItem[] {
  return rx.items.map((i) => {
    const drug = drugs.find((d) => d.id === i.drugId)
    return { drugId: i.drugId, drugName: i.drugName, batchNo: '', quantity: i.quantity, rate: drug?.mrp ?? 0, gstRate: drug?.gstRate ?? 0 }
  })
}

export function SalesTab() {
  const { data: sales, loading, setData } = useCollection(loadPharmacySales)
  const { data: patients } = useCollection(loadPatients)
  const { data: drugs } = useCollection(loadDrugs)
  const { data: batches, setData: setBatches } = useCollection(loadStockBatches)
  const { data: prescriptions, setData: setPrescriptions } = useCollection(loadPrescriptions)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))
  const pendingRxOptions = prescriptions
    .filter((rx) => rx.status === 'Pending')
    .map((rx) => ({ value: rx.id, label: `${rx.patientName} — ${formatDate(rx.date)} (${rx.items.length} items)` }))
  const drugOptions = drugs.map((d) => ({ value: d.id, label: d.name }))

  const itemColumns: LineItemColumn<PharmacySaleItem>[] = [
    {
      key: 'drugId', label: 'Drug', type: 'select', options: drugOptions, width: '26%',
      onSelect: (_row, value) => {
        const drug = drugs.find((d) => d.id === value)
        return { drugName: drug?.name ?? '', rate: drug?.mrp ?? 0, gstRate: drug?.gstRate ?? 0, batchNo: '' }
      },
    },
    { key: 'batchNo', label: 'Batch (optional)', type: 'text', width: '20%' },
    { key: 'quantity', label: 'Qty', type: 'number', width: '14%' },
    { key: 'rate', label: 'Rate', type: 'number', width: '14%' },
    { key: 'gstRate', label: 'GST %', type: 'number', width: '10%' },
  ]

  const sections: FormSection[] = [
    {
      title: 'Sale / Dispensing',
      fields: [
        { key: 'prescriptionId', label: 'From prescription (optional)', type: 'select', options: pendingRxOptions },
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions },
        { key: 'invoiceNumber', label: 'Invoice number', type: 'text', readonly: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
  ]

  function toFormValues(record: PharmacySale | null): FormValues {
    if (record) return { ...record }
    return {
      invoiceNumber: `PH-${new Date().getFullYear()}-${String(1001 + sales.length)}`,
      date: new Date().toISOString().slice(0, 10),
      status: 'Dispensed',
      items: [],
    }
  }

  function buildRecord(values: FormValues, editing: PharmacySale | null): PharmacySale {
    const patient = patients.find((p) => p.id === values.patientId)
    const items = (values.items ?? []) as PharmacySaleItem[]
    const base = {
      ...editing, ...values, items, totalAmount: computeTotal(items),
      patientName: patient?.name ?? editing?.patientName ?? values.patientName ?? '',
    } as PharmacySale
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as PharmacySale
  }

  async function handleSave(record: PharmacySale, editing: PharmacySale | null) {
    if (editing) {
      await updatePharmacySale(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
      return
    }
    await savePharmacySale(record)
    setData((rows) => [record, ...rows])

    if (record.status === 'Dispensed') {
      await postPharmacySaleToLedger(record, currentUser?.name ?? 'system')

      for (const item of record.items) {
        const batch = batches.find((b) => b.drugId === item.drugId && (item.batchNo ? b.batchNo === item.batchNo : true))
        if (batch) {
          const updated = withAudit({ ...batch, quantity: Math.max(0, batch.quantity - item.quantity) }, currentUser?.name ?? 'system', batch)
          await updateStockBatch(updated as never)
          setBatches((rows) => rows.map((b) => (b.id === batch.id ? (updated as typeof b) : b)))
        }
      }

      if (record.prescriptionId) {
        const rx = prescriptions.find((p) => p.id === record.prescriptionId)
        if (rx) {
          const updatedRx = withAudit({ ...rx, status: 'Dispensed' as const }, currentUser?.name ?? 'system', rx)
          await updatePrescription(updatedRx as Prescription)
          setPrescriptions((rows) => rows.map((r) => (r.id === rx.id ? (updatedRx as Prescription) : r)))
        }
      }
    }
  }

  return (
    <ResourceModule<PharmacySale>
      tableKey="pharmacy-sales"
      title="Sales & Dispensing"
      description="Over-the-counter sales and prescription dispensing — posts to the Ledger automatically."
      icon={ShoppingBag}
      columns={columns}
      rows={sales}
      permissionBase="pharmacy"
      newLabel="New Sale"
      drawerWidth="max-w-5xl"
      emptyMessage={loading ? 'Loading…' : 'No pharmacy sales recorded.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('sal') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => {
        const items = (values.items ?? []) as PharmacySaleItem[]
        return (
          <div className="flex flex-col gap-4">
            <SchemaForm
              sections={sections}
              values={values}
              onChange={(key, value) => {
                if (key === 'prescriptionId' && value) {
                  const rx = prescriptions.find((p) => p.id === value)
                  if (rx) {
                    setField('patientId', rx.patientId)
                    setField('items', itemsFromPrescription(rx, drugs))
                  }
                }
                setField(key, value)
              }}
            />
            <div>
              <p className="label">Items</p>
              <LineItemsEditor<PharmacySaleItem>
                columns={itemColumns}
                rows={items}
                onChange={(rows) => setField('items', rows)}
                newRow={() => ({ drugId: '', drugName: '', batchNo: '', quantity: 1, rate: 0, gstRate: 12 })}
                addLabel="Add item"
              />
              <p className="mt-2 text-right text-sm font-semibold text-text">
                Total: {formatCurrency(computeTotal(items))}
              </p>
            </div>
          </div>
        )
      }}
    />
  )
}
