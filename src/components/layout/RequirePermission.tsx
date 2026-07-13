import { ShieldAlert } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { EmptyState } from '@/components/ui/EmptyState'

export function RequirePermission({
  permission,
  children,
}: {
  permission: string
  children: React.ReactNode
}) {
  const { hasPermission, loading } = useAuth()
  if (loading) return null
  if (!hasPermission(permission)) {
    return (
      <div className="p-4 md:p-6">
        <EmptyState
          icon={ShieldAlert}
          title="You don't have access to this page"
          message={`This page requires the "${permission}" permission. Ask an Administrator to grant it in Users & Access, or switch to a user who has it.`}
        />
      </div>
    )
  }
  return <>{children}</>
}
