import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, HeartPulse } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { NAV_GROUPS } from '@/lib/nav'
import { useAuth } from '@/context/AuthContext'

const LS_COLLAPSED = 'ui.sidebarCollapsed'

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const { hasPermission } = useAuth()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(LS_COLLAPSED) === '1')

  function toggle() {
    setCollapsed((c) => {
      localStorage.setItem(LS_COLLAPSED, c ? '0' : '1')
      return !c
    })
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all md:static md:translate-x-0',
          collapsed ? 'md:w-16' : 'md:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-border p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-fg shadow-sm">
            <HeartPulse size={19} />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-text">Anjakha HMS</p>
              <p className="truncate text-[11px] text-muted">Hospital Management</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((item) => !item.permission || hasPermission(item.permission))
            if (items.length === 0) return null
            return (
              <div key={group.label} className={clsx('mb-3', group.inProgress && 'border-t border-border pt-3')}>
                {(!collapsed || mobileOpen) && (
                  <p className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {group.label}
                    {group.inProgress && (
                      <span className="rounded-full bg-muted/15 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-muted">
                        Coming soon
                      </span>
                    )}
                  </p>
                )}
                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      clsx(
                        'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
                        group.inProgress && !isActive
                          ? 'text-muted/70 hover:bg-surface-2 hover:text-muted'
                          : isActive
                            ? 'bg-gradient-to-r from-primary/15 to-primary/5 font-semibold text-primary shadow-sm'
                            : 'text-text hover:bg-surface-2',
                      )
                    }
                    title={collapsed && !mobileOpen ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !group.inProgress && (
                          <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary" />
                        )}
                        <item.icon size={17} className="shrink-0" />
                        {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        <button
          onClick={toggle}
          className="hidden items-center justify-center gap-2 border-t border-border p-3 text-xs text-muted hover:bg-surface-2 md:flex"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && 'Collapse'}
        </button>
      </aside>
    </>
  )
}
