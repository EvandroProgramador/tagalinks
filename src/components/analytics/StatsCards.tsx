import { Eye, MousePointer, TrendingUp } from 'lucide-react'
import type { AnalyticsSummary } from '@/types'

interface Props {
  summary: AnalyticsSummary
}

export function StatsCards({ summary }: Props) {
  const topLink = summary.top_links[0]

  const cards = [
    {
      icon: Eye,
      label: 'Visualizações',
      value: summary.total_views.toLocaleString('pt-PT'),
      color: 'text-brand-400',
      bg: 'bg-brand-500/10',
    },
    {
      icon: MousePointer,
      label: 'Cliques',
      value: summary.total_clicks.toLocaleString('pt-PT'),
      color: 'text-accent-400',
      bg: 'bg-accent-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Taxa de cliques',
      value: `${summary.click_rate}%`,
      sub: summary.total_views === 0 ? 'sem visitas' : `${summary.total_clicks} cliques em ${summary.total_views} visitas`,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      icon: MousePointer,
      label: 'Link mais clicado',
      value: topLink ? topLink.clicks.toLocaleString('pt-PT') : '—',
      sub: topLink ? topLink.label : 'sem cliques ainda',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
      {cards.map(({ icon: Icon, label, value, sub, color, bg }) => (
        <div key={label} className="group relative overflow-hidden card-interactive pl-6">
          <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-edge origin-center scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-4`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <p className="font-display text-3xl font-bold text-white leading-none tracking-tight">{value}</p>
          <p className="eyebrow mt-2">{label}</p>
          {sub && <p className="text-xs text-gray-600 mt-1.5 truncate">{sub}</p>}
        </div>
      ))}
    </div>
  )
}
