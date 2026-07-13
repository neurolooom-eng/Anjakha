import { Receipt } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { LineItemsEditor, type LineItemColumn } from '@/components/form/LineItemsEditor'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadInvoices, loadPatients, saveInvoice, updateInvoice, withAudit } from '@/lib/repository'
import { postInvoiceToLedger } from '@/lib/postings'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Invoice, InvoiceLineItem } from '@/types'

const CATEGORY_OPTIONS = ['OPD', 'IPD', 'Pharmacy'].map((v) => ({ value: v, label: v }))
const STATUS_OPTIONS = ['Draft', 'Unpaid', 'Partially Paid', 'Paid', 'Cancelled'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Invoice>[] = [
  { key: 'invoiceNumber', header: 'Invoice #', accessor: (r) => r.invoiceNumber, width: 150, nowrap: true },
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 180 },
  { key: 'category', header: 'Category', accessor: (r) => r.category, width: 100 },
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'total', header: 'Total', accessor: (r) => r.total, width: 110, render: (r) => formatCurrency(r.total) },
  { key: 'amountPaid', header: 'Paid', accessor: (r) => r.amountPaid, width: 110, render: (r) => formatCurrency(r.amountPaid) },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 130, render: (r) => <StatusCell value={r.status} /> },
]

export function computeInvoiceTotals(items: InvoiceLineItem[]) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const tax = items.reduce((s, i) => s + i.quantity * i.rate * (i.gstRate / 100), 0)
  const cgst = tax / 2
  const sgst = tax / 2
  return { subtotal, cgst, sgst, igst: 0, total: subtotal + tax }
}

export function InvoicesTab() {
  const { data: invoices, loading, setData } = useCollection(loadInvoices)
  const { data: patients } = useCollection(loadPatients)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))

  const itemColumns: LineItemColumn<InvoiceLineItem>[] = [
    { key: 'description', label: 'Description', type: 'text', width: '34%' },
    { key: 'hsnSacCode', label: 'HSN/SAC', type: 'text', width: '16%' },
    { key: 'quantity', label: 'Qty', type: 'number', width: '12%' },
    { key: 'rate', label: 'Rate', type: 'number', width: '14%' },
    { key: 'gstRate', label: 'GST %', type: 'number', width: '12%' },
  ]

  const sections: FormSection[] = [
    {
      title: 'Invoice',
      fields: [
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions, required: true },
        { key: 'category', label: 'Category', type: 'select', options: CATEGORY_OPTIONS, required: true },
        { key: 'invoiceNumber', label: 'Invoice number', type: 'text', readonly: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'amountPaid', label: 'Amount paid now', type: 'currency' },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
  ]

  function toFormValues(record: Invoice | null): FormValues {
    if (record) return { ...record }
    return {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(3001 + invoices.length)}`,
      date: new Date().toISOString().slice(0, 10),
      category: 'OPD',
      status: 'Unpaid',
      amountPaid: 0,
      items: [],
    }
  }

  function buildRecord(values: FormValues, editing: Invoice | null): Invoice {
    const patient = patients.find((p) => p.id === values.patientId)
    const items = (values.items ?? []) as InvoiceLineItem[]
    const totals = computeInvoiceTotals(items)
    const base = {
      ...editing, ...values, items, ...totals,
      patientName: patient?.name ?? editing?.patientName ?? '',
      status: values.amountPaid >= totals.total && totals.total > 0 ? 'Paid' : values.amountPaid > 0 ? 'Partially Paid' : values.status,
    } as Invoice
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Invoice
  }

  async function handleSave(record: Invoice, editing: Invoice | null) {
    if (editing) {
      await updateInvoice(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveInvoice(record)
      setData((rows) => [record, ...rows])
      await postInvoiceToLedger(record, currentUser?.name ?? 'system')
    }
  }

  return (
    <ResourceModule<Invoice>
      tableKey="billing-invoices"
      title="Invoices"
      description="GST-compliant patient billing across OPD, IPD, and Pharmacy — posts to the Ledger automatically."
      icon={Receipt}
      columns={columns}
      rows={invoices}
      permissionBase="billing"
      newLabel="New Invoice"
      drawerWidth="max-w-5xl"
      emptyMessage={loading ? 'Loading…' : 'No invoices raised.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('inv') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => {
        const items = (values.items ?? []) as InvoiceLineItem[]
        const totals = computeInvoiceTotals(items)
        return (
          <div className="flex flex-col gap-4">
            <SchemaForm sections={sections} values={values} onChange={setField} />
            <div>
              <p className="label">Line items</p>
              <LineItemsEditor<InvoiceLineItem>
                columns={itemColumns}
                rows={items}
                onChange={(rows) => setField('items', rows)}
                newRow={() => ({ description: '', hsnSacCode: '', quantity: 1, rate: 0, gstRate: 18 })}
                addLabel="Add line item"
              />
              <div className="mt-2 ml-auto max-w-xs space-y-1 text-sm">
                <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
                <div className="flex justify-between text-muted"><span>CGST</span><span>{formatCurrency(totals.cgst)}</span></div>
                <div className="flex justify-between text-muted"><span>SGST</span><span>{formatCurrency(totals.sgst)}</span></div>
                <div className="flex justify-between border-t border-border pt-1 font-semibold text-text"><span>Total</span><span>{formatCurrency(totals.total)}</span></div>
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}
