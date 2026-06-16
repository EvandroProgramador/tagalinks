import { ExternalLink, Copy, Check, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useEditorStore } from '@/store/useEditorStore'
import { Badge } from '@/components/ui/Badge'
import { NotificationsBell } from '@/components/layout/NotificationsBell'

interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { profile } = useAuth()
  const { page }    = useEditorStore()
  const [copied, setCopied] = useState(false)

  const planColors = {
    free:     'default' as const,
    creator:  'brand' as const,
  }

  const publicUrl = page?.slug ? `https://tagalinks.vercel.app/${page.slug}` : null

  function handleCopy() {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <header className="sticky top-0 h-14 flex items-center justify-between px-3 sm:px-5 bg-surface-card/80 backdrop-blur-xl border-b border-surface-border flex-shrink-0 gap-2 z-30">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex-shrink-0 p-2 rounded-xl text-gray-500 hover:text-white hover:bg-surface-elevated transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        {publicUrl && (
          <>
            <a
              href={publicUrl}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors min-w-0"
            >
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate hidden sm:inline">tagalinks.vercel.app/{page!.slug}</span>
            </a>
            <button
              onClick={handleCopy}
              title="Copiar link da página"
              className="flex-shrink-0 flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-elevated transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-xs hidden sm:inline">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs hidden sm:inline">Copiar link</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {profile?.plan && (
          <Badge variant={planColors[profile.plan] || 'default'} className="capitalize text-xs hidden sm:inline-flex">
            {profile.plan}
          </Badge>
        )}
        <NotificationsBell />
      </div>
    </header>
  )
}
