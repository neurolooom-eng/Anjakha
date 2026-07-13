import { Fragment } from 'react'
import { Users2 } from 'lucide-react'
import { useCollection } from '@/lib/useCollection'
import { loadGroups, updateGroup } from '@/lib/repository'
import { useAuth } from '@/context/AuthContext'
import { permissionsByModule } from '@/lib/permissions'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Group } from '@/types'

export function GroupsTab() {
  const { data: groups, loading, setData } = useCollection(loadGroups)
  const { hasPermission } = useAuth()
  const canEdit = hasPermission('admin:access')
  const moduleMap = permissionsByModule()

  async function toggle(group: Group, key: string) {
    if (!canEdit) return
    const has = group.permissions.includes(key)
    const permissions = has ? group.permissions.filter((p) => p !== key) : [...group.permissions, key]
    const updated: Group = { ...group, permissions }
    await updateGroup(updated)
    setData((rows) => rows.map((g) => (g.id === group.id ? updated : g)))
  }

  if (loading) return null
  if (groups.length === 0) return <EmptyState icon={Users2} title="No groups configured" />

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-text">
          <Users2 size={18} className="text-primary" /> Groups & Permissions
        </h1>
        <p className="text-sm text-muted">Toggle module permissions per group. Changes apply immediately.</p>
      </div>
      <div className="card overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr>
              <th className="min-w-[220px] border-b border-border px-3 py-2 text-left text-xs font-semibold text-muted">Permission</th>
              {groups.map((g) => (
                <th key={g.id} className="min-w-[110px] border-b border-border px-2 py-2 text-center text-xs font-semibold text-muted">
                  {g.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(moduleMap).map(([mod, perms]) => (
              <Fragment key={mod}>
                <tr className="bg-surface-2/60">
                  <td colSpan={groups.length + 1} className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {mod}
                  </td>
                </tr>
                {perms.map((p) => (
                  <tr key={p.key} className="border-t border-border">
                    <td className="px-3 py-2 text-text">{p.label}</td>
                    {groups.map((g) => (
                      <td key={g.id} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={g.permissions.includes(p.key)}
                          disabled={!canEdit}
                          onChange={() => toggle(g, p.key)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
