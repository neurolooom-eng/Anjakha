import { ShieldCheck } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusCell } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadClaims, loadInvoices, loadPatients, loadPolicies, saveClaim, updateClaim, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Claim } from '@/types'

const STATUS_OPTIONS = [
  'Pre-auth Requested', 'Pre-auth Approved', 'Pre-auth Rejected', 'Claim Submitted', 'Settled', 'Repudiated',
].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Claim>[] = [
  { key: 'claimNumber', header: 'Claim #', accessor: (r) => r.claimNumber, width: 140, nowrap: true },
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 170 },
  { key: 'insurerName', header: 'Insurer', accessor: (r) => r.insurerName, width: 170 },
  { key: 'date', header: 'Date', accessor: (r) => r.date, width: 110, render: (r) => formatDate(r.date) },
  { key: 'claimAmount', header: 'Claim amt', accessor: (r) => r.claimAmount, width: 110, render: (r) => formatCurrency(r.claimAmount) },
  { key: 'settledAmount', header: 'Settled', accessor: (r) => r.settledAmount ?? 0, width: 110, render: (r) => (r.settledAmount ? formatCurrency(r.settledAmount) : '—') },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 160, render: (r) => <StatusCell value={r.status} /> },
]

export function ClaimsTab() {
  const { data: claims, loading, setData } = useCollection(loadClaims)
  const { data: patients } = useCollection(loadPatients)
  const { data: policies } = useCollection(loadPolicies)
  const { data: invoices } = useCollection(loadInvoices)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))
  const policyOptions = policies.map((p) => ({ value: p.id, label: `${p.policyNumber} — ${p.insurerName} (${p.patientName})` }))
  const invoiceOptions = invoices.map((i) => ({ value: i.id, label: `${i.invoiceNumber} — ${i.patientName}` }))

  const sections: FormSection[] = [
    {
      title: 'Claim',
      fields: [
        { key: 'claimNumber', label: 'Claim number', type: 'text', readonly: true },
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions, required: true },
        { key: 'policyId', label: 'Policy', type: 'select', options: policyOptions, required: true },
        { key: 'invoiceId', label: 'Linked invoice (optional)', type: 'select', options: invoiceOptions },
        { key: 'date', label: 'Date', type: 'date', required: true },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
    {
      title: 'Amounts',
      fields: [
        { key: 'claimAmount', label: 'Claim amount', type: 'currency', required: true },
        { key: 'approvedAmount', label: 'Approved amount', type: 'currency' },
        { key: 'settledAmount', label: 'Settled amount', type: 'currency' },
        { key: 'remarks', label: 'Remarks', type: 'textarea' },
      ],
    },
  ]

  function toFormValues(record: Claim | null): FormValues {
    if (record) return { ...record }
    return {
      claimNumber: `CLM-${new Date().getFullYear()}-${String(770 + claims.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      status: 'Pre-auth Requested',
    }
  }

  function buildRecord(values: FormValues, editing: Claim | null): Claim {
    const patient = patients.find((p) => p.id === values.patientId)
    const policy = policies.find((p) => p.id === values.policyId)
    const base = {
      ...editing, ...values,
      patientName: patient?.name ?? editing?.patientName ?? '',
      policyNumber: policy?.policyNumber ?? editing?.policyNumber ?? '',
      insurerName: policy?.insurerName ?? editing?.insurerName ?? '',
    } as Claim
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Claim
  }

  async function handleSave(record: Claim, editing: Claim | null) {
    if (editing) {
      await updateClaim(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveClaim(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Claim>
      tableKey="insurance-claims"
      title="Pre-auth & Claims"
      description="Cashless pre-authorization and claim settlement tracking against insurer policies."
      icon={ShieldCheck}
      columns={columns}
      rows={claims}
      permissionBase="insurance"
      newLabel="New Claim"
      emptyMessage={loading ? 'Loading…' : 'No claims recorded.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('clm') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
