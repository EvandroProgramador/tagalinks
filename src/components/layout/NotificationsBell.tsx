import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Eye, MousePointerClick, Link2, TrendingUp, ArrowRight } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Spinner } from '@/components/ui/Spinner'

const SEEN_KEY = 'tl_notif_seen_total'

const SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok:    'TikTok',
  whatsapp:  'WhatsApp',
  facebook:  'Facebook',
  twitter:   'Twitter',
  youtube:   'YouTube',
  direct:    'Direto',
  other:     'Outras',
}

export function NotificationsBell() {
  const { page } = useEditorStore()
  const { summary, loading, fetch } = useAnalytics()
  const [open, setOpen] = useState(false)
  const [hasUnseen, setHasUnseen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const fetchedFor = useRef<string | null>(null)

  // Busca atividade quando o dropdown abre (uma vez por página)
  useEffect(() => {
    if (open && page?.id && fetchedFor.current !== page.id) {
      fetchedFor.current = page.id
      fetch(page.id, 7)
    }
  }, [open, page?.id, fetch])

  // Calcula ponto de "não lido" comparando atividade total com o último visto
  useEffect(() => {
    if (!summary) return
    const total = summary.total_views + summary.total_clicks
    const seen = Number(localStorage.getItem(SEEN_KEY) || 0)
    if (open) {
      localStorage.setItem(SEEN_KEY, String(total))
      setHasUnseen(false)
    } else {
      setHasUnseen(total > seen)
    }
  }, [summary, open])

  // Fechar ao clicar fora ou premir Escape
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const todayViews = summary?.views_by_day.at(-1)?.views ?? 0
  const topLink    = summary?.top_links[0]
  const topSource  = summary?.sources[0]
  const hasActivity = !!summary && (summary.total_views > 0 || summary.total_clicks > 0)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Atividade recente"
        className="relative p-2 rounded-xl text-gray-500 hover:text-white hover:bg-surface-elevated transition-all hover:scale-105 active:scale-95"
      >
        <Bell className="w-4 h-4" />
        {hasUnseen && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-400 ring-2 ring-surface-card animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface-card border border-surface-border rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-up">
          <div className="px-4 py-3 border-b border-surface-border">
            <p className="text-sm font-semibold text-white">Atividade</p>
            <p className="text-xs text-gray-500">Últimos 7 dias</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : !hasActivity ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400">Sem atividade recente</p>
                <p className="text-xs text-gray-500 mt-1">
                  Partilha o teu link para começares a receber visitas.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-surface-border">
                {todayViews > 0 && (
                  <ActivityRow icon={Eye} iconClass="text-sky-400">
                    <span className="text-brand-300 font-semibold">+{todayViews}</span> visitas hoje
                  </ActivityRow>
                )}
                <ActivityRow icon={Eye} iconClass="text-gray-400">
                  <span className="text-white font-semibold">{summary!.total_views}</span> visitas nos últimos 7 dias
                </ActivityRow>
                <ActivityRow icon={MousePointerClick} iconClass="text-emerald-400">
                  <span className="text-white font-semibold">{summary!.total_clicks}</span> cliques · CTR {summary!.click_rate}%
                </ActivityRow>
                {topLink && (
                  <ActivityRow icon={Link2} iconClass="text-brand-400">
                    Link mais clicado: <span className="text-white font-medium">'{topLink.label}'</span> · {topLink.clicks} cliques
                  </ActivityRow>
                )}
                {topSource && (
                  <ActivityRow icon={TrendingUp} iconClass="text-amber-400">
                    Origem principal: <span className="text-white font-medium">{SOURCE_LABELS[topSource.source] || topSource.source}</span> ({topSource.pct}%)
                  </ActivityRow>
                )}
              </ul>
            )}
          </div>

          <Link
            to="/dashboard/analytics"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-3 border-t border-surface-border text-sm text-brand-400 hover:text-brand-300 hover:bg-surface-elevated transition-all"
          >
            Ver analytics completo
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}

function ActivityRow({
  icon: Icon,
  iconClass,
  children,
}: {
  icon: typeof Eye
  iconClass: string
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconClass}`} />
      <p className="text-sm text-gray-400 leading-snug">{children}</p>
    </li>
  )
}
