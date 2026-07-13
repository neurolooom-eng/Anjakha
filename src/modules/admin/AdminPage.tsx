import { useState } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { UsersTab } from './UsersTab'
import { GroupsTab } from './GroupsTab'

const TABS = [
  { key: 'users', label: 'Users' },
  { key: 'groups', label: 'Groups & Permissions' },
]

export function AdminPage() {
  const [tab, setTab] = useState('users')
  return (
    <div className="flex flex-col gap-4">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'users' && <UsersTab />}
      {tab === 'groups' && <GroupsTab />}
    </div>
  )
}
