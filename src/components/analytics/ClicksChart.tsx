import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { AnalyticsSummary } from '@/types'

interface Props {
  data: AnalyticsSummary['views_by_day']
}

export function ClicksChart({ data }: Props) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Visualizações e cliques (30 dias)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#6B6B7B', fontSize: 11 }} tickLine={false} axisLine={false}
                 tickFormatter={(d) => d.slice(5)} />
          <YAxis tick={{ fill: '#6B6B7B', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1C1C27', border: '1px solid #2A2A3A', borderRadius: 12 }}
            labelStyle={{ color: '#9B9BAA', fontSize: 12 }}
            itemStyle={{ color: '#F8F8FF', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="views"  stroke="#7C3AED" strokeWidth={2} dot={false} name="Visitas" />
          <Line type="monotone" dataKey="clicks" stroke="#06B6D4" strokeWidth={2} dot={false} name="Cliques" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
