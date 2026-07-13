import { FileCheck2 } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadInsurers, loadPatients, loadPolicies, savePolicy, updatePolicy, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate, daysUntil } from '@/lib/format'
import { makeId } from '@/lib/id'
import type { Policy } from '@/types'

const STATUS_OPTIONS = ['Active', 'Expired'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<Policy>[] = [
  { key: 'patientName', header: 'Patient', accessor: (r) => r.patientName, width: 180 },
  { key: 'insurerName', header: 'Insurer', accessor: (r) => r.insurerName, width: 190 },
  { key: 'policyNumber', header: 'Policy #', accessor: (r) => r.policyNumber, width: 140, nowrap: true },
  { key: 'sumInsured', header: 'Sum insured', accessor: (r) => r.sumInsured, width: 130, render: (r) => formatCurrency(r.sumInsured) },
  {
    key: 'validTill', header: 'Valid till', accessor: (r) => r.validTill, width: 150,
    render: (r) => {
      const days = daysUntil(r.validTill)
      return <StatusChip value={formatDate(r.validTill)} tone={days < 0 ? 'danger' : days <= 30 ? 'warning' : 'neutral'} />
    },
  },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusChip value={r.status} tone={r.status === 'Active' ? 'success' : 'danger'} /> },
]

export function PoliciesTab() {
  const { data: policies, loading, setData } = useCollection(loadPolicies)
  const { data: patients } = useCollection(loadPatients)
  const { data: insurers } = useCollection(loadInsurers)
  const { currentUser } = useAuth()

  const patientOptions = patients.map((p) => ({ value: p.id, label: `${p.name} (${p.uhid})` }))
  const insurerOptions = insurers.map((i) => ({ value: i.id, label: i.name }))

  const sections: FormSection[] = [
    {
      title: 'Policy',
      fields: [
        { key: 'patientId', label: 'Patient', type: 'select', options: patientOptions, required: true },
        { key: 'insurerId', label: 'Insurer / TPA', type: 'select', options: insurerOptions, required: true },
        { key: 'policyNumber', label: 'Policy number', type: 'text', required: true },
        { key: 'sumInsured', label: 'Sum insured', type: 'currency', required: true },
        { key: 'validTill', label: 'Valid till', type: 'date', required: true },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
  ]

  function toFormValues(record: Policy | null): FormValues {
    if (record) return { ...record }
    return { status: 'Active' }
  }

  function buildRecord(values: FormValues, editing: Policy | null): Policy {
    const patient = patients.find((p) => p.id === values.patientId)
    const insurer = insurers.find((i) => i.id === values.insurerId)
    const base = {
      ...editing, ...values,
      patientName: patient?.name ?? editing?.patientName ?? '',
      insurerName: insurer?.name ?? editing?.insurerName ?? '',
    } as Policy
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Policy
  }

  async function handleSave(record: Policy, editing: Policy | null) {
    if (editing) {
      await updatePolicy(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await savePolicy(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Policy>
      tableKey="insurance-policies"
      title="Patient Policies"
      description="Insurance policies linked to patients, for pre-auth and claims."
      icon={FileCheck2}
      columns={columns}
      rows={policies}
      permissionBase="insurance"
      newLabel="Add Policy"
      emptyMessage={loading ? 'Loading…' : 'No policies recorded.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('pol') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
