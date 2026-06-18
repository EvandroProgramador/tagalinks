import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePage } from '@/hooks/usePage'
import { useEditorStore } from '@/store/useEditorStore'
import { useAnalytics } from '@/hooks/useAnalytics'
import { StatsCards } from '@/components/analytics/StatsCards'
import { ClicksChart } from '@/components/analytics/ClicksChart'
import { SourcesChart } from '@/components/analytics/SourcesChart'
import { UpgradeGate } from '@/components/ui/UpgradeGate'
import { Spinner } from '@/components/ui/Spinner'

export default function Analytics() {
  const { user, profile } = useAuth()
  const { loadPage } = usePage()
  const { page } = useEditorStore()
  const { summary, loading, fetch: fetchAnalytics } = useAnalytics()
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (user?.id) loadPage(user.id)
  }, [user?.id])

  useEffect(() => {
    if (page?.id) fetchAnalytics(page.id, days)
  }, [page?.id, days, fetchAnalytics])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-slide-up">
        <h1 className="font-display text-3xl font-bold text-white">Analytics</h1>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="input w-auto text-sm py-2"
        >
          <option value={7}  className="bg-surface-elevated">7 dias</option>
          <option value={30} className="bg-surface-elevated">30 dias</option>
          <option value={90} className="bg-surface-elevated">90 dias</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : summary ? (
        <>
          <StatsCards summary={summary} />

          <UpgradeGate requiredPlan="creator" currentPlan={profile?.plan || 'free'} featureName="Gráfico de tendências">
            <ClicksChart data={summary.views_by_day} days={days} />
          </UpgradeGate>

          <UpgradeGate requiredPlan="creator" currentPlan={profile?.plan || 'free'} featureName="Origens de tráfego">
            <SourcesChart sources={summary.sources} />
          </UpgradeGate>

          {/* Top links */}
          <div className="card animate-slide-up">
            <h3 className="eyebrow mb-4">Links mais clicados</h3>
            {summary.top_links.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Ainda sem cliques registados</p>
            ) : (
              <div className="space-y-2">
                {summary.top_links.map((link, i) => (
                  <div key={link.id} className="group flex items-center gap-3 rounded-lg -mx-2 px-2 py-1 transition-colors hover:bg-surface-elevated/50">
                    <span className="font-mono text-xs text-gray-600 w-5">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm text-white truncate">{link.label}</p>
                        <span className="font-mono text-xs text-gray-400 flex-shrink-0">{link.clicks} cliques</span>
                      </div>
                      <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-tagatech rounded-full transition-[width] duration-700 ease-out"
                          style={{ width: `${link.ctr}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-10 text-gray-500 animate-fade-in">
          <p className="text-3xl mb-2 inline-block">📊</p>
          <p className="text-sm">Ainda não há dados. Publica a tua página primeiro!</p>
        </div>
      )}
    </div>
  )
}
