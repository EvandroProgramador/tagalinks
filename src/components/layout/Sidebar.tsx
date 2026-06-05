import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Edit3, BarChart2, Palette, Settings, Zap, LogOut, Shield, Store } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/dashboard',                 icon: LayoutDashboard, label: 'Início',            end: true },
  { to: '/dashboard/editor',          icon: Edit3,           label: 'Editor' },
  { to: '/dashboard/analytics',       icon: BarChart2,       label: 'Analytics' },
  { to: '/dashboard/appearance',      icon: Palette,         label: 'Aparência' },
  { to: '/dashboard/integrar-loja',   icon: Store,           label: 'Integrar com a loja' },
  { to: '/dashboard/settings',        icon: Settings,        label: 'Definições' },
  { to: '/dashboard/upgrade',         icon: Zap,             label: 'Upgrade',            highlight: true },
]

export function Sidebar() {
  const { signOut, profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <aside className="w-56 h-screen flex flex-col bg-surface-card border-r border-surface-border flex-shrink-0">
      <div className="p-4 border-b border-surface-border">
        <Logo className="h-[109px]" />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, end, highlight }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
              isActive
                ? 'bg-brand-500/15 text-brand-300 font-medium'
                : highlight
                  ? 'text-brand-400 hover:bg-brand-500/10'
                  : 'text-gray-400 hover:bg-surface-elevated hover:text-white',
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-surface-border" />
            <NavLink to="/dashboard/admin"
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-medium'
                  : 'text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-300',
              )}>
              <Shield className="w-4 h-4 flex-shrink-0" />
              Admin
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-surface-border">
        {profile && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-tagatech flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile.name}</p>
              <p className="text-xs text-gray-500 truncate">@{profile.username}</p>
            </div>
          </div>
        )}
        <button onClick={signOut}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  )
}
