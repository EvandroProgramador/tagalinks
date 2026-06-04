import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import type { AnalyticsSummary } from '@/types'

const COLORS = ['#7C3AED', '#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#8B5CF6']

const SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', whatsapp: 'WhatsApp',
  facebook: 'Facebook', twitter: 'Twitter', youtube: 'YouTube', direct: 'Directo', other: 'Outro',
}

interface Props {
  sources: AnalyticsSummary['sources']
}

export function SourcesChart({ sources }: Props) {
  const data = sources.map((s) => ({ name: SOURCE_LABELS[s.source] || s.source, value: s.count }))

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Origens de tráfego</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1C1C27', border: '1px solid #2A2A3A', borderRadius: 12 }}
            itemStyle={{ color: '#F8F8FF', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#9B9BAA' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
