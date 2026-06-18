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

      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="eyebrow px-3 mb-2">Menu</p>
        <div className="space-y-0.5">
          {nav.map(({ to, icon: Icon, label, end, highlight }) => (
            <NavLink
              key={to} to={to} end={end}
              onClick={onClose}
              className={({ isActive }) => cn(
                'group relative flex items-center gap-3 overflow-hidden pl-4 pr-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-surface-elevated text-white font-medium'
                  : highlight
                    ? 'text-brand-300 hover:bg-brand-500/10'
                    : 'text-gray-400 hover:bg-surface-elevated hover:text-white',
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Aresta de acento — assinatura: cresce no hover, cheia quando activo */}
                  <span className={cn(
                    'absolute left-0 top-0 h-full w-[3px] bg-gradient-edge origin-center transition-transform duration-300',
                    isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-50',
                  )} />
                  <Icon className="w-4 h-4 flex-shrink-0" />
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
            className="group relative flex items-center gap-3 overflow-hidden pl-4 pr-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-surface-elevated hover:text-white transition-all duration-200"
          >
            <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-edge origin-center scale-y-0 group-hover:scale-y-50 transition-transform duration-300" />
            <YouTubeIcon className="w-4 h-4 flex-shrink-0" />
            Tutorial
          </a>
        </div>

        {isAdmin && (
          <>
            <p className="eyebrow px-3 mt-5 mb-2">Admin</p>
            <NavLink to="/dashboard/admin" onClick={onClose}
              className={({ isActive }) => cn(
                'group relative flex items-center gap-3 overflow-hidden pl-4 pr-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-amber-500/15 text-amber-300 font-medium'
                  : 'text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-300',
              )}>
              {({ isActive }) => (
                <>
                  <span className={cn(
                    'absolute left-0 top-0 h-full w-[3px] bg-amber-400 origin-center transition-transform duration-300',
                    isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-50',
                  )} />
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  Admin
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-3 border-t border-surface-border">
        {profile && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name}
                   className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-tagatech flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {profile.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile.name}</p>
              <p className="font-mono text-[0.7rem] text-gray-500 truncate">@{profile.username}</p>
            </div>
          </div>
        )}
        <button onClick={signOut}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  )
}
