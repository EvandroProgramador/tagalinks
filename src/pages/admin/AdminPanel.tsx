import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { subDays, format, parseISO } from 'date-fns'
import { pt } from 'date-fns/locale'
import {
  Shield, Users, BarChart2, CreditCard, Eye,
  TrendingUp, TrendingDown, RefreshCw, Search, ExternalLink,
  ChevronDown, Crown, Zap, Globe, Activity,
  AlertTriangle, CheckCircle, XCircle, Clock, Minus,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { Profile, Subscription, SubscriptionPlan } from '@/types'

/* ─── tipos internos ─── */

interface AdminStats {
  totalUsers:    number
  newUsers7d:    number
  newUsersLast7: number
  publishedPages: number
  views7d:       number
  viewsLast7:    number
  clicks7d:      number
  revenue:       number
  activeSubs:    number
}

interface AdminUser extends Profile {
  link_pages?: { id: string; slug: string; published: boolean }[]
}

interface AdminSub extends Subscription {
  profiles?: { name: string; email: string; username?: string }
}

type Tab         = 'overview' | 'users' | 'analytics' | 'subscriptions'
type PlanFilter  = 'all' | 'free' | 'creator' | 'business'
type TimeRange   = '7d' | '30d' | '90d'

const PLAN_META: Record<SubscriptionPlan, { label: string; color: string; icon: React.ElementType }> = {
  free:     { label: 'Free',     color: 'text-gray-400 bg-gray-500/15 border-gray-500/20',     icon: Minus   },
  creator:  { label: 'Creator',  color: 'text-brand-300 bg-brand-500/15 border-brand-500/20',  icon: Zap     },
  business: { label: 'Business', color: 'text-amber-300 bg-amber-500/15 border-amber-500/20',  icon: Crown   },
}

const SUB_STATUS_META = {
  active:    { label: 'Activo',     icon: CheckCircle, color: 'text-green-400' },
  trial:     { label: 'Trial',      icon: Clock,       color: 'text-blue-400'  },
  cancelled: { label: 'Cancelado',  icon: XCircle,     color: 'text-red-400'   },
  expired:   { label: 'Expirado',   icon: AlertTriangle, color: 'text-amber-400' },
}

function kz(n: number) {
  return new Intl.NumberFormat('pt-PT').format(n) + ' Kz'
}

function trend(current: number, prev: number) {
  if (prev === 0) return null
  const pct = Math.round(((current - prev) / prev) * 100)
  return pct
}

/* ─── stat card ─── */

function StatCard({
  label, value, sub, icon: Icon, iconColor, trend: t, loading,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; iconColor: string; trend?: number | null; loading?: boolean
}) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <span className={cn('w-8 h-8 rounded-xl flex items-center justify-center', iconColor)}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-surface-elevated rounded-lg animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white">{value}</p>
      )}
      <div className="flex items-center justify-between">
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
        {t != null && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium',
            t >= 0 ? 'text-green-400' : 'text-red-400')}>
            {t >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(t)}% vs semana passada
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── plan badge ─── */

function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
  const m = PLAN_META[plan]
  const Icon = m.icon
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', m.color)}>
      <Icon className="w-3 h-3" /> {m.label}
    </span>
  )
}

/* ─── tab: visão geral ─── */

function OverviewTab({ stats, loading, recentUsers }: {
  stats: AdminStats | null; loading: boolean; recentUsers: AdminUser[]
}) {
  const planDist = recentUsers.reduce<Record<string, number>>(
    (acc, u) => { acc[u.plan] = (acc[u.plan] || 0) + 1; return acc }, {}
  )
  const total = recentUsers.length || 1

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Utilizadores" value={stats?.totalUsers ?? '—'}
          sub={`+${stats?.newUsers7d ?? 0} esta semana`}
          icon={Users} iconColor="bg-brand-500/20 text-brand-400"
          trend={trend(stats?.newUsers7d ?? 0, stats?.newUsersLast7 ?? 0)}
          loading={loading} />
        <StatCard label="Páginas publicadas" value={stats?.publishedPages ?? '—'}
          sub={`de ${stats?.totalUsers ?? 0} utilizadores`}
          icon={Globe} iconColor="bg-cyan-500/20 text-cyan-400"
          loading={loading} />
        <StatCard label="Visualizações / 7d" value={(stats?.views7d ?? 0).toLocaleString('pt-PT')}
          icon={Eye} iconColor="bg-green-500/20 text-green-400"
          trend={trend(stats?.views7d ?? 0, stats?.viewsLast7 ?? 0)}
          loading={loading} />
        <StatCard label="Receita activa" value={stats ? kz(stats.revenue) : '—'}
          sub={`${stats?.activeSubs ?? 0} subscrições activas`}
          icon={CreditCard} iconColor="bg-amber-500/20 text-amber-400"
          loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registos recentes */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" /> Registos recentes
          </h3>
          <div className="space-y-2">
            {recentUsers.slice(0, 8).map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500
                                flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {(u.name?.[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    @{u.username || '—'} · {format(parseISO(u.created_at), 'dd MMM', { locale: pt })}
                  </p>
                </div>
                <PlanBadge plan={u.plan} />
              </div>
            ))}
            {recentUsers.length === 0 && !loading && (
              <p className="text-sm text-gray-600 py-4 text-center">Sem utilizadores ainda</p>
            )}
          </div>
        </div>

        {/* Distribuição de planos */}
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" /> Distribuição de planos
          </h3>
          <div className="space-y-3">
            {(['free', 'creator', 'business'] as SubscriptionPlan[]).map((plan) => {
              const count = planDist[plan] || 0
              const pct   = Math.round((count / total) * 100)
              const m     = PLAN_META[plan]
              const Icon  = m.icon
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn('flex items-center gap-1.5 text-xs font-medium', m.color.split(' ')[0])}>
                      <Icon className="w-3 h-3" /> {m.label}
                    </span>
                    <span className="text-xs text-gray-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${pct}%`, background:
                           plan === 'free' ? '#6B7280' :
                           plan === 'creator' ? '#7C3AED' : '#F59E0B' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Métricas rápidas */}
          <div className="mt-5 pt-4 border-t border-surface-border grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {stats ? Math.round((stats.publishedPages / Math.max(stats.totalUsers, 1)) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">têm página publicada</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {stats ? Math.round((stats.activeSubs / Math.max(stats.totalUsers, 1)) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-0.5">são pagantes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── tab: utilizadores ─── */

function UsersTab() {
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [changing, setChanging] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, link_pages(id, slug, published)')
      .order('created_at', { ascending: false })
    if (error) { toast.error('Erro ao carregar utilizadores'); setLoading(false); return }
    setUsers((data as AdminUser[]) || [])
    setLoading(false)
  }

  async function changePlan(userId: string, plan: SubscriptionPlan) {
    setChanging(userId)
    const { error } = await supabase.from('profiles').update({ plan }).eq('id', userId)
    if (error) { toast.error('Erro ao alterar plano') }
    else {
      toast.success(`Plano alterado para ${PLAN_META[plan].label}`)
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, plan } : u))
    }
    setChanging(null)
    setOpenMenu(null)
  }

  async function changeRole(userId: string, role: 'admin' | 'user') {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (error) { toast.error('Erro ao alterar role') }
    else {
      toast.success(role === 'admin' ? 'Utilizador promovido a admin' : 'Admin removido')
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u))
    }
    setOpenMenu(null)
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q)
    const matchPlan = planFilter === 'all' || u.plan === planFilter
    return matchSearch && matchPlan
  })

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="input pl-9 text-sm w-full"
            placeholder="Pesquisar por nome, email ou @username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'free', 'creator', 'business'] as PlanFilter[]).map((p) => (
            <button key={p} onClick={() => setPlanFilter(p)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                      planFilter === p
                        ? 'border-brand-500/70 bg-brand-500/10 text-brand-300'
                        : 'border-surface-border text-gray-500 hover:text-white')}>
              {p === 'all' ? 'Todos' : PLAN_META[p as SubscriptionPlan].label}
            </button>
          ))}
        </div>
        <button onClick={fetchUsers} className="btn-ghost p-2" title="Actualizar">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizador</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Página</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Registo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-surface-elevated rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && filtered.map((u) => {
                const page = u.link_pages?.[0]
                return (
                  <tr key={u.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-cyan-600
                                        flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {(u.name?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate max-w-36">{u.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-36">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {u.username ? `@${u.username}` : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {changing === u.id
                        ? <span className="text-xs text-gray-500">A alterar…</span>
                        : <PlanBadge plan={u.plan} />}
                    </td>
                    <td className="px-4 py-3">
                      {page ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0',
                            page.published ? 'bg-green-400' : 'bg-gray-600')} />
                          <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer"
                             className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                            /{page.slug} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : <span className="text-xs text-gray-600">Sem página</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.role === 'admin'
                        ? <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        : <span className="text-xs text-gray-500">User</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {format(parseISO(u.created_at), 'dd MMM yyyy', { locale: pt })}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                              className="p-1.5 rounded-lg hover:bg-surface-elevated text-gray-500 hover:text-white transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {openMenu === u.id && (
                        <div className="absolute right-4 top-10 z-20 bg-surface-card border border-surface-border
                                        rounded-xl shadow-2xl shadow-black/40 py-1 min-w-44">
                          <p className="px-3 py-1.5 text-xs text-gray-600 font-medium uppercase tracking-wider">
                            Alterar plano
                          </p>
                          {(['free', 'creator', 'business'] as SubscriptionPlan[]).map((p) => (
                            <button key={p} onClick={() => changePlan(u.id, p)}
                                    disabled={u.plan === p}
                                    className={cn('flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors',
                                      u.plan === p
                                        ? 'text-gray-600 cursor-default'
                                        : 'text-gray-300 hover:bg-surface-elevated hover:text-white')}>
                              {(() => { const Icon = PLAN_META[p].icon; return <Icon className="w-3.5 h-3.5" /> })()}
                              {PLAN_META[p].label}
                              {u.plan === p && <CheckCircle className="w-3 h-3 ml-auto text-green-500" />}
                            </button>
                          ))}
                          <div className="my-1 border-t border-surface-border" />
                          <button onClick={() => changeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-400
                                             hover:bg-amber-500/10 transition-colors">
                            <Shield className="w-3.5 h-3.5" />
                            {u.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum utilizador encontrado</p>
          </div>
        )}
        {!loading && (
          <div className="px-4 py-2 border-t border-surface-border text-xs text-gray-600">
            {filtered.length} de {users.length} utilizadores
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── tab: analytics ─── */

function AnalyticsTab() {
  const [range, setRange]     = useState<TimeRange>('30d')
  const [chartData, setChartData] = useState<{ date: string; views: number; clicks: number }[]>([])
  const [topPages, setTopPages]   = useState<{ slug: string; title: string; views: number }[]>([])
  const [loading, setLoading]     = useState(true)

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90

  useEffect(() => { fetchAnalytics() }, [range])

  async function fetchAnalytics() {
    setLoading(true)
    const since = subDays(new Date(), days).toISOString()

    const [viewsRes, clicksRes, pagesRes] = await Promise.all([
      supabase.from('page_views').select('created_at').gte('created_at', since),
      supabase.from('link_clicks').select('created_at').gte('created_at', since),
      supabase.from('page_views').select('page_id, link_pages(slug, title)').gte('created_at', since),
    ])

    // Agrupa views por dia
    const viewsByDay: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
      viewsByDay[d] = 0
    }
    ;(viewsRes.data || []).forEach((v) => {
      const d = v.created_at.slice(0, 10)
      if (d in viewsByDay) viewsByDay[d]++
    })

    // Agrupa clicks por dia
    const clicksByDay: Record<string, number> = {}
    Object.keys(viewsByDay).forEach((d) => { clicksByDay[d] = 0 })
    ;(clicksRes.data || []).forEach((c) => {
      const d = c.created_at.slice(0, 10)
      if (d in clicksByDay) clicksByDay[d]++
    })

    const chart = Object.keys(viewsByDay)
      .sort()
      .map((date) => ({
        date: format(parseISO(date), days <= 30 ? 'dd/MM' : 'dd MMM', { locale: pt }),
        views: viewsByDay[date],
        clicks: clicksByDay[date] || 0,
      }))
    setChartData(chart)

    // Top páginas por views
    const pageCount: Record<string, { slug: string; title: string; views: number }> = {}
    ;(pagesRes.data || []).forEach((row: any) => {
      const page = Array.isArray(row.link_pages) ? row.link_pages[0] : row.link_pages
      if (!page) return
      const key = page.slug
      if (!pageCount[key]) pageCount[key] = { slug: page.slug, title: page.title || page.slug, views: 0 }
      pageCount[key].views++
    })
    const top = Object.values(pageCount).sort((a, b) => b.views - a.views).slice(0, 8)
    setTopPages(top)

    setLoading(false)
  }

  const totalViews  = chartData.reduce((s, d) => s + d.views, 0)
  const totalClicks = chartData.reduce((s, d) => s + d.clicks, 0)
  const peakDay     = [...chartData].sort((a, b) => b.views - a.views)[0]
  const maxViews    = topPages[0]?.views || 1

  return (
    <div className="space-y-6">
      {/* Cabeçalho com range */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalViews.toLocaleString('pt-PT')}</p>
            <p className="text-xs text-gray-500">visualizações</p>
          </div>
          <div className="w-px h-10 bg-surface-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">{totalClicks.toLocaleString('pt-PT')}</p>
            <p className="text-xs text-gray-500">cliques</p>
          </div>
          {totalViews > 0 && (
            <>
              <div className="w-px h-10 bg-surface-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-300">
                  {Math.round((totalClicks / totalViews) * 100)}%
                </p>
                <p className="text-xs text-gray-500">CTR médio</p>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-1">
          {(['7d', '30d', '90d'] as TimeRange[]).map((r) => (
            <button key={r} onClick={() => setRange(r)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      range === r
                        ? 'border-brand-500/70 bg-brand-500/10 text-brand-300'
                        : 'border-surface-border text-gray-500 hover:text-white')}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de área */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Visualizações e cliques ao longo do tempo</h3>
        {loading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#13131A', border: '1px solid #2A2A3A', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#9B9BAA' }}
              />
              <Area type="monotone" dataKey="views"  stroke="#7C3AED" strokeWidth={2} fill="url(#gViews)"  name="Views" />
              <Area type="monotone" dataKey="clicks" stroke="#06B6D4" strokeWidth={2} fill="url(#gClicks)" name="Cliques" />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {peakDay && !loading && (
          <p className="text-xs text-gray-600 mt-2 text-center">
            Pico: {peakDay.views} views em {peakDay.date}
          </p>
        )}
      </div>

      {/* Top páginas */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Top páginas por visualizações</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-surface-elevated rounded-lg animate-pulse" />
            ))}
          </div>
        ) : topPages.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-6">Sem dados no período seleccionado</p>
        ) : (
          <div className="space-y-2">
            {topPages.map((p, i) => (
              <div key={p.slug} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-600 w-5 text-right flex-shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate">{p.title}</span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{p.views} views</span>
                  </div>
                  <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all"
                         style={{ width: `${Math.round((p.views / maxViews) * 100)}%` }} />
                  </div>
                </div>
                <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer"
                   className="text-gray-600 hover:text-white transition-colors flex-shrink-0">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── tab: subscrições ─── */

function SubsTab() {
  const [subs, setSubs]       = useState<AdminSub[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSubs() }, [])

  async function fetchSubs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, profiles(name, email, username)')
      .order('created_at', { ascending: false })
    if (error) { toast.error('Erro ao carregar subscrições') }
    else setSubs((data as AdminSub[]) || [])
    setLoading(false)
  }

  const activeSubs   = subs.filter((s) => s.status === 'active')
  const totalRevenue = activeSubs.reduce((sum, s) => sum + (s.amount || 0), 0)
  const monthRevenue = activeSubs
    .filter((s) => new Date(s.period_start) > subDays(new Date(), 30))
    .reduce((sum, s) => sum + (s.amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-white">{activeSubs.length}</p>
          <p className="text-xs text-gray-500 mt-1">Subscrições activas</p>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-amber-400">{kz(totalRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Receita recorrente</p>
        </div>
        <div className="bg-surface-card border border-surface-border rounded-2xl p-5 text-center">
          <p className="text-2xl font-bold text-green-400">{kz(monthRevenue)}</p>
          <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <h3 className="text-sm font-semibold text-gray-300">Histórico de subscrições</h3>
          <button onClick={fetchSubs} className="btn-ghost p-1.5" title="Actualizar">
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizador</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ref. AppyPay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-surface-elevated rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && subs.map((s) => {
                const profile = s.profiles
                const stMeta  = SUB_STATUS_META[s.status] || SUB_STATUS_META.expired
                const StIcon  = stMeta.icon
                return (
                  <tr key={s.id} className="hover:bg-surface-elevated/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{profile?.name || '—'}</p>
                      <p className="text-xs text-gray-500">{profile?.email || '—'}</p>
                    </td>
                    <td className="px-4 py-3"><PlanBadge plan={s.plan} /></td>
                    <td className="px-4 py-3 font-medium text-amber-300">{kz(s.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('flex items-center gap-1.5 text-xs font-medium', stMeta.color)}>
                        <StIcon className="w-3.5 h-3.5" /> {stMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {format(parseISO(s.period_start), 'dd/MM/yy')} –{' '}
                      {format(parseISO(s.period_end),   'dd/MM/yy')}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                      {s.appypay_ref || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && subs.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sem subscrições ainda</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── painel principal ─── */

export default function AdminPanel() {
  const [tab, setTab]               = useState<Tab>('overview')
  const [stats, setStats]           = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [recentUsers, setRecentUsers]   = useState<AdminUser[]>([])
  const [lastRefresh, setLastRefresh]   = useState(new Date())

  const loadOverview = useCallback(async () => {
    setStatsLoading(true)
    const now     = new Date()
    const ago7    = subDays(now, 7).toISOString()
    const ago14   = subDays(now, 14).toISOString()

    const [
      { count: totalUsers },
      { count: newUsers7d },
      { count: newUsersLast7 },
      { count: publishedPages },
      { count: views7d },
      { count: viewsLast7 },
      { count: clicks7d },
      { data: activeSubs },
      { data: users },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', ago7),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', ago14).lt('created_at', ago7),
      supabase.from('link_pages').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', ago7),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', ago14).lt('created_at', ago7),
      supabase.from('link_clicks').select('*', { count: 'exact', head: true }).gte('created_at', ago7),
      supabase.from('subscriptions').select('amount').eq('status', 'active'),
      supabase.from('profiles').select('*, link_pages(id, slug, published)').order('created_at', { ascending: false }).limit(20),
    ])

    const revenue = (activeSubs || []).reduce((s: number, r: any) => s + (r.amount || 0), 0)

    setStats({
      totalUsers:    totalUsers || 0,
      newUsers7d:    newUsers7d || 0,
      newUsersLast7: newUsersLast7 || 0,
      publishedPages: publishedPages || 0,
      views7d:       views7d || 0,
      viewsLast7:    viewsLast7 || 0,
      clicks7d:      clicks7d || 0,
      revenue,
      activeSubs:    (activeSubs || []).length,
    })
    setRecentUsers((users as AdminUser[]) || [])
    setLastRefresh(new Date())
    setStatsLoading(false)
  }, [])

  useEffect(() => { loadOverview() }, [loadOverview])

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',       label: 'Visão Geral',   icon: Activity    },
    { id: 'users',          label: 'Utilizadores',  icon: Users       },
    { id: 'analytics',      label: 'Analytics',     icon: BarChart2   },
    { id: 'subscriptions',  label: 'Subscrições',   icon: CreditCard  },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20
                          flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Painel Admin</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20
                               border border-amber-500/30 text-amber-300 uppercase tracking-wider">
                Admin Mode
              </span>
            </div>
            <p className="text-xs text-gray-500">
              TagaLinks · actualizado {format(lastRefresh, "HH:mm 'de' dd/MM/yyyy")}
            </p>
          </div>
        </div>
        <button onClick={loadOverview} disabled={statsLoading}
                className="btn-ghost flex items-center gap-1.5 text-sm">
          <RefreshCw className={cn('w-4 h-4', statsLoading && 'animate-spin')} /> Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
                  className={cn('flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                    tab === id
                      ? 'bg-surface-elevated text-white shadow-sm'
                      : 'text-gray-500 hover:text-white')}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === 'overview'       && <OverviewTab stats={stats} loading={statsLoading} recentUsers={recentUsers} />}
      {tab === 'users'          && <UsersTab />}
      {tab === 'analytics'      && <AnalyticsTab />}
      {tab === 'subscriptions'  && <SubsTab />}
    </div>
  )
}
