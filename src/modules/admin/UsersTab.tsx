import { UserCog } from 'lucide-react'
import type { DataTableColumn } from '@/components/table/DataTable'
import { SchemaForm, type FormSection, type FormValues } from '@/components/form/SchemaForm'
import { StatusChip } from '@/components/ui/StatusChip'
import { ResourceModule } from '@/modules/ResourceModule'
import { useCollection } from '@/lib/useCollection'
import { loadGroups, loadUsers, saveUser, updateUser } from '@/lib/repository'
import { makeId } from '@/lib/id'
import type { User } from '@/types'

const STATUS_OPTIONS = ['Active', 'Inactive'].map((v) => ({ value: v, label: v }))

const columns: DataTableColumn<User>[] = [
  { key: 'name', header: 'Name', accessor: (r) => r.name, width: 200 },
  { key: 'email', header: 'Email', accessor: (r) => r.email, width: 240 },
  { key: 'groupName', header: 'Group', accessor: (r) => r.groupName, width: 160, render: (r) => <StatusChip value={r.groupName} tone="primary" /> },
  { key: 'status', header: 'Status', accessor: (r) => r.status, width: 100, render: (r) => <StatusChip value={r.status} tone={r.status === 'Active' ? 'success' : 'neutral'} /> },
]

export function UsersTab() {
  const { data: users, loading, setData } = useCollection(loadUsers)
  const { data: groups } = useCollection(loadGroups)

  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }))

  const sections: FormSection[] = [
    {
      title: 'User',
      fields: [
        { key: 'name', label: 'Full name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'groupId', label: 'Group', type: 'select', options: groupOptions, required: true },
        { key: 'status', label: 'Status', type: 'status', options: STATUS_OPTIONS },
      ],
    },
  ]

  function toFormValues(record: User | null): FormValues {
    if (record) return { ...record }
    return { status: 'Active' }
  }

  function buildRecord(values: FormValues, editing: User | null): User {
    const group = groups.find((g) => g.id === values.groupId)
    return { ...editing, ...values, groupName: group?.name ?? editing?.groupName ?? '' } as User
  }

  async function handleSave(record: User, editing: User | null) {
    if (editing) {
      await updateUser(record)
      setData((rows) => rows.map((r) => (r.id === record.id ? record : r)))
    } else {
      await saveUser(record)
      setData((rows) => [record, ...rows])
    }
  }

  return (
    <ResourceModule<User>
      tableKey="admin-users"
      title="Users"
      description="Everyone with access to Anjakha HMS and which group they belong to."
      icon={UserCog}
      columns={columns}
      rows={users}
      permissionBase="admin"
      createPermission="admin:access"
      editPermission="admin:access"
      newLabel="Add User"
      emptyMessage={loading ? 'Loading…' : 'No users configured.'}
      toFormValues={toFormValues}
      buildRecord={(values, editing) => buildRecord({ ...values, id: editing?.id ?? makeId('usr') }, editing)}
      onSave={handleSave}
      renderForm={(values, setField) => (
        <SchemaForm sections={sections} values={values} onChange={setField} />
      )}
    />
  )
}
