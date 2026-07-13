import { IdCard, KeyRound } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadDoctors, loadGroups, loadUsers, saveDoctor, saveUser, updateDoctor, withAudit } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency } from '@/lib/format'
import { makeId } from '@/lib/id'
import { DEPARTMENTS } from '@/modules/patients/Appointments'
import type { Doctor } from '@/types'

const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))

const sections: FormSection[] = [
  {
    title: 'Doctor details',
    fields: [
      { key: 'name', label: 'Full name', type: 'text', required: true, placeholder: 'Dr. Firstname Lastname' },
      { key: 'department', label: 'Department / specialization', type: 'select', options: DEPARTMENTS.map((d) => ({ value: d, label: d })), required: true },
      { key: 'qualification', label: 'Qualification', type: 'text', required: true },
      { key: 'registrationNo', label: 'Medical registration number', type: 'text', required: true },
    ],
  },
  {
    title: 'Contact & fee',
    fields: [
      { key: 'phone', label: 'Phone', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'consultationFee', label: 'Consultation fee', type: 'currency' },
      { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
    ],
  },
]

export function DoctorRegistryTab() {
  const { data: doctors, loading, setData } = useCollection(loadDoctors)
  const { data: users, setData: setUsers } = useCollection(loadUsers)
  const { data: groups } = useCollection(loadGroups)
  const { currentUser, hasPermission } = useAuth()
  const canManageLogins = hasPermission('admin:access')
  const doctorGroup = groups.find((g) => g.name === 'Doctor')

  async function createLogin(doctor: Doctor) {
    if (!doctorGroup) return
    const user = withAudit(
      {
        id: makeId('usr'),
        name: doctor.name,
        email: doctor.email || `${doctor.name.toLowerCase().replace(/[^a-z]+/g, '.')}@anjakha.in`,
        groupId: doctorGroup.id,
        groupName: doctorGroup.name,
        status: 'Active' as const,
        doctorId: doctor.id,
      },
      currentUser?.name ?? 'system',
    )
    // Users have no audit fields in their type — strip what withAudit added beyond the User shape.
    const { id, name, email, groupId, groupName, status, doctorId } = user
    await saveUser({ id, name, email, groupId, groupName, status, doctorId })
    setUsers((rows) => [{ id, name, email, groupId, groupName, status, doctorId }, ...rows])
  }

  const columns: DataTableColumn<Doctor>[] = [
    { key: 'name', header: 'Name', accessor: (r) => r.name, width: 190 },
    { key: 'department', header: 'Department', accessor: (r) => r.department, width: 150 },
    { key: 'qualification', header: 'Qualification', accessor: (r) => r.qualification, width: 220 },
    { key: 'phone', header: 'Phone', accessor: (r) => r.phone, width: 150, nowrap: true },
    { key: 'consultationFee', header: 'Fee', accessor: (r) => r.consultationFee ?? 0, width: 100, render: (r) => (r.consultationFee ? formatCurrency(r.consultationFee) : '—') },
    { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusChip value={r.status} tone={r.status === 'Active' ? 'success' : 'neutral'} /> },
    {
      key: 'login', header: 'Login', width: 150, sortable: false,
      render: (r) => {
        const linked = users.find((u) => u.doctorId === r.id)
        if (linked) return <StatusChip value={linked.email} tone="primary" dot={false} />
        if (!canManageLogins) return <span className="text-muted">—</span>
        return (
          <button
            className="btn-outline !py-1 !text-xs"
            onClick={(e) => { e.stopPropagation(); createLogin(r) }}
          >
            <KeyRound size={12} /> Create Login
          </button>
        )
      },
    },
  ]

  function toFormValues(record: Doctor | null): FormValues {
    if (record) return { ...record }
    return { status: 'Active' }
  }

  function buildRecord(values: FormValues, editing: Doctor | null): Doctor {
    const base = { ...editing, ...values } as Doctor
    return withAudit(base, currentUser?.name ?? 'system', editing ?? undefined) as Doctor
  }

  async function handleSave(record: Doctor, editing: Doctor | null) {
    if (editing) {
      await updateDoctor(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveDoctor(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<Doctor>
      tableKey="doctors-registry"
      title="Doctor Registry"
      description="Master list of consulting doctors. Create a login to give a doctor their own view of the schedule, queue, and console."
      icon={IdCard}
      columns={columns}
      rows={doctors}
      permissionBase="doctors"
      newLabel="Add Doctor"
      emptyMessage={loading ? 'Loading…' : 'No doctors registered yet.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('doc') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
