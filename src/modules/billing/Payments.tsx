import { Wallet } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadInvoices, loadPayments, savePayment, updateInvoice, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Payment } from '@/types'

const MODE_OPTIONS = ['Cash', 'Card', 'UPI', 'Net Banking', 'Cheque', 'Insurance'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Payment>[] = [
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'invoiceNumber', header: 'Invoice #', accessor: (r) => r.invoiceNumber, width: 140, nowrap: true },
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 180 },
  { key: 'amount', header: 'Amount', accessor: (r) => r.amount, width: 110, render: (r) => formatCurrency(r.amount) },
  { key: 'mode', header: 'Mode', accessor: (r) => r.mode, width: 120, render: (r) => <StatusChip value={r.mode} tone="info" /> },
  { key: 'referenceNo', header: 'Reference', accessor: (r) => r.referenceNo ?? '', width: 160 },
]

export function PaymentsTab() {
  const { data: payments, loading, setData } = useCollection(loadPayments)
  const { data: invoices, setData: setInvoices } = useCollection(loadInvoices)
  const { currentUser } = useAuth()

  const unpaidInvoices = invoices.filter((i) => i.status !== 'Paid' && i.status !== 'Cancelled')
  const invoiceOptions = unpaidInvoices.map((i) => ({
    value: i.id, label: `${i.invoiceNumber} — ${i.patientName} (${formatCurrency(i.total - i.amountPaid)} due)`,
  }))

  const sections: FormSection[] = [
    {
      title: 'Payment',
      fields: [
        { key: 'invoiceId', label: 'Invoice', type: 'select', options: invoiceOptions, required: true },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'amount', label: 'Amount', type: 'currency', required: true },
        { key: 'mode', label: 'Payment mode', type: 'select', options: MODE_OPTIONS, required: true },
        { key: 'referenceNo', label: 'Reference number', type: 'text' },
      ],
    },
  ]

  function toFormValues(): FormValues {
    return { date: new Date().toISOString().slice(0, 10), mode: 'Cash' }
  }

  function buildRecord(values: FormValues): Payment {
    const invoice = invoices.find((i) => i.id === values.invoiceId)
    const base = { ...values, invoiceNumber: invoice?.invoiceNumber ?? '', patientName: invoice?.patientName ?? '' } as Payment
    return withAudit(base, currentUser?.name ?? 'system') as Payment
  }

  async function handleSave(record: Payment) {
    await savePayment(record)
    setData((rows) => [record, ...rows])

    const invoice = invoices.find((i) => i.id === record.invoiceId)
    if (invoice) {
      const newPaid = invoice.amountPaid + record.amount
      const updated = withAudit(
        { ...invoice, amountPaid: newPaid, status: newPaid >= invoice.total ? 'Paid' : 'Partially Paid' },
        currentUser?.name ?? 'system',
        invoice,
      )
      await updateInvoice(updated as never)
      setInvoices((rows) => rows.map((i) => (i.id === invoice.id ? (updated as typeof i) : i)))
    }
  }

  return (
    <ResourceModule<Payment>
      tableKey="billing-payments"
      title="Payments"
      description="Payment collection against outstanding invoices."
      icon={Wallet}
      columns={columns}
      rows={payments}
      permissionBase="billing"
      newLabel="Record Payment"
      emptyMessage={loading ? 'Loading…' : 'No payments recorded.'}
      toFormValues={toFormValues}
      buildRecord={(values) => buildRecord({ ...values, id: makeId('pay') })}
      onSave={handleSave}
      onRowClick={() => {}}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
