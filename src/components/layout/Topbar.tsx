import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown, LogOut, Menu, Palette } from 'lucide-react'
import { NAV_GROUPS } from '@/lib/nav'
import { useAuth } from '@/context/AuthContext'
import { useTheme, THEMES } from '@/context/ThemeContext'
import { Avatar } from '@/components/ui/Avatar'

function useBreadcrumb() {
  const { pathname } = useLocation()
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.path === pathname || (item.path !== '/' && pathname.startsWith(item.path))) {
        return { group: group.label, page: item.label }
      }
    }
  }
  return { group: 'Overview', page: 'Dashboard' }
}

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { group, page } = useBreadcrumb()
  const { currentUser, currentGroup, users, switchUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [themeOpen, setThemeOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2 text-sm">
        <button className="btn-ghost !p-1.5 md:hidden" onClick={onOpenMobileNav} aria-label="Open navigation">
          <Menu size={18} />
        </button>
        <span className="text-muted">{group}</span>
        <span className="mx-1.5 text-muted/60">/</span>
        <span className="font-semibold text-text">{page}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button className="btn-ghost" onClick={() => setThemeOpen((s) => !s)}>
            <Palette size={16} />
          </button>
          {themeOpen && (
            <>
              <button className="fixed inset-0 z-10" aria-label="Close" onClick={() => setThemeOpen(false)} />
              <div className="absolute right-0 z-20 mt-1.5 w-52 rounded-xl border border-border bg-surface p-2 shadow-elevated">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id)
                      setThemeOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-surface-2"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-border"
                      style={{ backgroundColor: t.swatch }}
                    />
                    <span className={theme === t.id ? 'font-semibold text-primary' : 'text-text'}>{t.label}</span>
                    <span className="ml-auto text-[10px] uppercase text-muted">{t.mode}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm transition-colors hover:border-border hover:bg-surface-2"
            onClick={() => setUserOpen((s) => !s)}
          >
            <Avatar name={currentUser?.name ?? '?'} size={28} />
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium text-text">{currentUser?.name ?? 'Guest'}</span>
              <span className="block text-[10px] text-muted">{currentGroup?.name ?? '—'}</span>
            </span>
            <ChevronDown size={14} className="text-muted" />
          </button>
          {userOpen && (
            <>
              <button className="fixed inset-0 z-10" aria-label="Close" onClick={() => setUserOpen(false)} />
              <div className="absolute right-0 z-20 mt-1.5 w-64 rounded-xl border border-border bg-surface p-2 shadow-elevated">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  Switch user (demo)
                </p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id)
                      setUserOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-surface-2 ${
                      u.id === currentUser?.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Avatar name={u.name} size={24} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-text">{u.name}</span>
                      <span className="block truncate text-[10px] text-muted">{u.groupName}</span>
                    </span>
                  </button>
                ))}
                <div className="mt-1 border-t border-border pt-1">
                  <button className="btn-ghost w-full justify-start text-xs text-danger">
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
