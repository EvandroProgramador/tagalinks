import { ExternalLink, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEditorStore } from '@/store/useEditorStore'
import { Badge } from '@/components/ui/Badge'

export function Topbar() {
  const { profile } = useAuth()
  const { page }    = useEditorStore()

  const planColors = {
    free:     'default' as const,
    creator:  'brand' as const,
    business: 'accent' as const,
  }

  return (
    <header className="h-14 flex items-center justify-between px-5 bg-surface-card border-b border-surface-border flex-shrink-0">
      <div className="flex items-center gap-3">
        {page?.slug && (
          <a
            href={`/${page.slug}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            tagalinks.ao/{page.slug}
          </a>
        )}
      </div>

      <div className="flex items-center gap-3">
        {profile?.plan && (
          <Badge variant={planColors[profile.plan] || 'default'} className="capitalize text-xs">
            {profile.plan}
          </Badge>
        )}
        <button className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-surface-elevated transition-all">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
