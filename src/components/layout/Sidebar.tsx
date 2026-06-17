import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Edit3, BarChart2, Palette, Settings, Zap, LogOut, Shield, Store, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { YouTubeIcon } from '@/components/ui/BrandIcons'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/dashboard',                 icon: LayoutDashboard, label: 'Início',            end: true },
  { to: '/dashboard/editor',          icon: Edit3,           label: 'Editor' },
  { to: '/dashboard/appearance',      icon: Palette,         label: 'Aparência' },
  { to: '/dashboard/integrar-loja',   icon: Store,           label: 'Integrar com a loja' },
  { to: '/dashboard/analytics',       icon: BarChart2,       label: 'Analytics' },
  { to: '/dashboard/settings',        icon: Settings,        label: 'Definições' },
  { to: '/dashboard/upgrade',         icon: Zap,             label: 'Upgrade',            highlight: true },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { signOut, profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface-card border-r border-surface-border transition-transform duration-300',
      'lg:sticky lg:top-0 lg:self-start lg:z-auto lg:w-56 lg:h-dvh lg:flex-shrink-0 lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    )}>
      <div className="p-4 border-b border-surface-border relative">
        <Logo className="h-[109px]" />
        <button
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-surface-elevated transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label, end, highlight }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={onClose}
            className={({ isActive }) => cn(
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
              isActive
                ? 'bg-brand-500/15 text-brand-300 font-medium'
                : highlight
                  ? 'text-brand-400 hover:bg-brand-500/10'
                  : 'text-gray-400 hover:bg-surface-elevated hover:text-white hover:translate-x-0.5',
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-gradient-tagatech transition-all duration-300',
                  isActive ? 'h-5 opacity-100' : 'h-0 opacity-0',
                )} />
                <Icon className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {label}
              </>
            )}
          </NavLink>
        ))}
        <a
          href="https://www.youtube.com/@tagatech"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-surface-elevated hover:text-white hover:translate-x-0.5 transition-all duration-200"
        >
          <YouTubeIcon className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          Tutorial
        </a>
        {isAdmin && (
          <>
            <div className="my-2 border-t border-surface-border" />
            <NavLink to="/dashboard/admin" onClick={onClose}
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
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name}
                   className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-tagatech flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {profile.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
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
