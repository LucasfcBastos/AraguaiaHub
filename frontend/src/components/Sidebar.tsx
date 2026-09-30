import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { getDisplayName, getInitial } from '../utils/userDisplay'
import { useGetMyRole } from '../hooks/backend/appUsers'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/produtos', label: 'Produtos', icon: Package },
]

export default function Sidebar() {
  const { user } = useCurrentUser()
  const displayName = getDisplayName(user)
  const navigate = useNavigate()
  const { data: myRole, trigger: fetchMyRole } = useGetMyRole()

  useEffect(() => {
    fetchMyRole()
  }, [fetchMyRole])

  const isAdmin = myRole?.role === 'admin'

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-none flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 overflow-hidden px-5 py-5">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white dark:bg-red-500">
          {getInitial(displayName)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <span className="min-w-0 truncate text-base font-bold text-foreground" title={displayName}>
            {displayName}
          </span>
          {isAdmin ? (
            <span className="w-fit rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900 dark:bg-violet-900/40 dark:text-violet-100">
              Admin
            </span>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4 flex-none" />
              <span className="min-w-0 truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto p-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          SAIR
        </button>
      </div>
    </aside>
  )
}
