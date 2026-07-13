import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Group, User } from '@/types'
import { loadGroups, loadUsers } from '@/lib/repository'

interface AuthContextValue {
  currentUser: User | null
  currentGroup: Group | null
  users: User[]
  groups: Group[]
  loading: boolean
  switchUser: (userId: string) => void
  hasPermission: (key: string) => boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const LS_CURRENT_USER = 'auth.currentUserId'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => localStorage.getItem(LS_CURRENT_USER))
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const [u, g] = await Promise.all([loadUsers(), loadGroups()])
    setUsers(u)
    setGroups(g)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (!loading && !currentUserId && users.length > 0) {
      setCurrentUserId(users[0].id)
    }
  }, [loading, currentUserId, users])

  function switchUser(userId: string) {
    setCurrentUserId(userId)
    localStorage.setItem(LS_CURRENT_USER, userId)
  }

  const currentUser = useMemo(() => users.find((u) => u.id === currentUserId) ?? null, [users, currentUserId])
  const currentGroup = useMemo(
    () => groups.find((g) => g.id === currentUser?.groupId) ?? null,
    [groups, currentUser],
  )

  function hasPermission(key: string): boolean {
    return currentGroup?.permissions.includes(key) ?? false
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, currentGroup, users, groups, loading, switchUser, hasPermission, refresh }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
