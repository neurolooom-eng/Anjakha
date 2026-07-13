import { Truck } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { LineItemsEditor, type LineItemColumn } from '@/components/form/LineItemsEditor'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import {
  loadDrugs, loadPharmacyPurchases, loadStockBatches, savePharmacyPurchase, saveStockBatch,
  updatePharmacyPurchase, withAudit,
} from '@/lib/repository'
import { postPharmacyPurchaseToLedger } from '@/lib/postings'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { PharmacyPurchase, PharmacyPurchaseItem } from '@/types'

const STATUS_OPTIONS = ['Draft', 'Ordered', 'Received', 'Cancelled'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<PharmacyPurchase>[] = [
  { key: 'grnNumber', header: 'GRN #', accessor: (r) => r.grnNumber, width: 140, nowrap: true },
  { key: 'supplierName', header: 'Supplier', accessor: (r) => r.supplierName, width: 200 },
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'items', header: 'Items', accessor: (r) => r.items.length, width: 80 },
  { key: 'totalAmount', header: 'Amount', accessor: (r) => r.totalAmount, width: 120, render: (r) => formatCurrency(r.totalAmount) },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 120, render: (r) => <StatusCell value={r.status} /> },
]

function computeTotal(items: PharmacyPurchaseItem[]) {
  return items.reduce((sum, i) => sum + i.quantity * i.rate * (1 + i.gstRate / 100), 0)
}

export function PurchasesTab() {
  const { data: purchases, loading, setData } = useCollection(loadPharmacyPurchases)
  const { data: drugs } = useCollection(loadDrugs)
  const { setData: setBatches } = useCollection(loadStockBatches)
  const { currentUser } = useAuth()

  const drugOptions = drugs.map((d) => ({ value: d.id, label: d.name }))

  const itemColumns: LineItemColumn<PharmacyPurchaseItem>[] = [
    {
      key: 'drugId', label: 'Drug', type: 'select', options: drugOptions, width: '24%',
      onSelect: (_row, value) => {
        const drug = drugs.find((d) => d.id === value)
        return { drugName: drug?.name ?? '', gstRate: drug?.gstRate ?? 0 }
      },
    },
    { key: 'batchNo', label: 'Batch', type: 'text', width: '16%' },
    { key: 'expiryDate', label: 'Expiry', type: 'text', width: '16%' },
    { key: 'quantity', label: 'Qty', type: 'number', width: '12%' },
    { key: 'rate', label: 'Rate', type: 'number', width: '12%' },
    { key: 'gstRate', label: 'GST %', type: 'number', width: '10%' },
  ]

  const sections: FormSection[] = [
    {
      title: 'Purchase / GRN',
      fields: [
        { key: 'grnNumber', label: 'GRN number', type: 'text', readonly: true },
        { key: 'supplierName', label: 'Supplier', type: 'text', required: true },
        { key: 'supplierGstin', label: 'Supplier GSTIN', type: 'text' },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
  ]

  function toFormValues(record: PharmacyPurchase | null): FormValues {
    if (record) return { ...record }
    return {
      grnNumber: `GRN-${new Date().getFullYear()}-${String(purchases.length + 41).padStart(4, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      status: 'Received',
      items: [],
    }
  }

  function buildRecord(values: FormValues, editing: PharmacyPurchase | null): PharmacyPurchase {
    const items = (values.items ?? []) as PharmacyPurchaseItem[]
    const base = {
      ...editing, ...values, items, totalAmount: computeTotal(items),
    } as PharmacyPurchase
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as PharmacyPurchase
  }

  async function handleSave(record: PharmacyPurchase, editing: PharmacyPurchase | null) {
    if (editing) {
      await updatePharmacyPurchase(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await savePharmacyPurchase(record)
      setData((rows) => [record, ...rows])
      if (record.status === 'Received') {
        await postPharmacyPurchaseToLedger(record, currentUser?.name ?? 'system')
        for (const item of record.items) {
          const batch = withAudit(
            {
              id: makeId('stk'), drugId: item.drugId, drugName: item.drugName, batchNo: item.batchNo,
              expiryDate: item.expiryDate, quantity: item.quantity, purchaseRate: item.rate,
              mrp: drugs.find((d) => d.id === item.drugId)?.mrp ?? item.rate, supplierName: record.supplierName,
            },
            currentUser?.name ?? 'system',
          )
          await saveStockBatch(batch as never)
          setBatches((rows) => [batch as never, ...rows])
        }
      }
    }
  }

  return (
    <ResourceModule<PharmacyPurchase>
      tableKey="pharmacy-purchases"
      title="Purchases (GRN)"
      description="Supplier purchases — receiving posts stock batches and a ledger entry automatically."
      icon={Truck}
      columns={columns}
      rows={purchases}
      permissionBase="pharmacy"
      newLabel="New GRN"
      drawerWidth="max-w-5xl"
      emptyMessage={loading ? 'Loading…' : 'No purchases recorded.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('grn') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <div className="flex flex-col gap-4">
          <SchemaForm sections={sections} values={values} onChange={setField} />
          <div>
            <p className="label">Items</p>
            <LineItemsEditor<PharmacyPurchaseItem>
              columns={itemColumns}
              rows={(values.items ?? []) as PharmacyPurchaseItem[]}
              onChange={(rows) => setField('items', rows)}
              newRow={() => ({ drugId: '', drugName: '', batchNo: '', expiryDate: '', quantity: 0, rate: 0, gstRate: 12 })}
              addLabel="Add item"
            />
            <p className="mt-2 text-right text-sm font-semibold text-text">
              Total: {formatCurrency(computeTotal((values.items ?? []) as PharmacyPurchaseItem[]))}
            </p>
          </div>
        </div>
      )}
    />
  )
}
