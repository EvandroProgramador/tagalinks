import { Eye, MousePointer, TrendingUp, ShoppingBag } from 'lucide-react'
import type { AnalyticsSummary } from '@/types'

interface Props {
  summary: AnalyticsSummary
}

export function StatsCards({ summary }: Props) {
  const cards = [
    { icon: Eye,           label: 'Visualizações',  value: summary.total_views,  color: 'text-brand-400',  bg: 'bg-brand-500/10' },
    { icon: MousePointer,  label: 'Cliques',         value: summary.total_clicks, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { icon: TrendingUp,    label: 'Taxa de cliques', value: `${summary.click_rate}%`, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: ShoppingBag,   label: 'Vendas',          value: summary.total_sales,  color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="card">
          <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
            <Icon className={`w-4.5 h-4.5 ${color}`} />
          </div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}
