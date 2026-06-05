import { ExternalLink, Bell, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useEditorStore } from '@/store/useEditorStore'
import { Badge } from '@/components/ui/Badge'

export function Topbar() {
  const { profile } = useAuth()
  const { page }    = useEditorStore()
  const [copied, setCopied] = useState(false)

  const planColors = {
    free:     'default' as const,
    creator:  'brand' as const,
    business: 'accent' as const,
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
    <header className="h-14 flex items-center justify-between px-5 bg-surface-card border-b border-surface-border flex-shrink-0">
      <div className="flex items-center gap-3">
        {publicUrl && (
          <>
            <a
              href={publicUrl}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              tagalinks.vercel.app/{page!.slug}
            </a>
            <button
              onClick={handleCopy}
              title="Copiar link da página"
              className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-lg text-gray-400 hover:text-white hover:bg-surface-elevated transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400 text-xs">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs">Copiar link</span>
                </>
              )}
            </button>
          </>
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
