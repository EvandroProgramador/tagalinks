import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AnalyticsSummary } from '@/types'

export function useAnalytics(pageId: string | null) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = useCallback(async (days = 30) => {
    if (!pageId) return
    setLoading(true)
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const [viewsRes, clicksRes, itemsRes] = await Promise.all([
      supabase.from('page_views').select('*').eq('page_id', pageId).gte('created_at', since),
      supabase.from('link_clicks').select('*').eq('page_id', pageId).gte('created_at', since),
      supabase.from('link_items').select('id, label').eq('page_id', pageId),
    ])

    const views  = viewsRes.data  || []
    const clicks = clicksRes.data || []
    const items  = itemsRes.data  || []

    const clicksByItem: Record<string, number> = {}
    for (const c of clicks) {
      clicksByItem[c.link_item_id] = (clicksByItem[c.link_item_id] || 0) + 1
    }

    const top_links = items
      .map((i) => ({ id: i.id, label: i.label, clicks: clicksByItem[i.id] || 0,
                     ctr: views.length ? Math.round((clicksByItem[i.id] || 0) / views.length * 100) : 0 }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)

    const byDay: Record<string, { views: number; clicks: number }> = {}
    for (const v of views) {
      const d = v.created_at.slice(0, 10)
      if (!byDay[d]) byDay[d] = { views: 0, clicks: 0 }
      byDay[d].views++
    }
    for (const c of clicks) {
      const d = c.created_at.slice(0, 10)
      if (!byDay[d]) byDay[d] = { views: 0, clicks: 0 }
      byDay[d].clicks++
    }
    const views_by_day = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }))

    const srcCount: Record<string, number> = {}
    for (const v of views) srcCount[v.referrer || 'direct'] = (srcCount[v.referrer || 'direct'] || 0) + 1
    const sources = Object.entries(srcCount)
      .map(([source, count]) => ({ source: source as any, count,
                                   pct: Math.round(count / (views.length || 1) * 100) }))
      .sort((a, b) => b.count - a.count)

    const devCount: Record<string, number> = {}
    for (const v of views) devCount[v.device || 'mobile'] = (devCount[v.device || 'mobile'] || 0) + 1
    const devices = Object.entries(devCount)
      .map(([device, count]) => ({ device: device as any, count }))

    setSummary({
      total_views:  views.length,
      total_clicks: clicks.length,
      total_sales:  0,
      click_rate:   views.length ? Math.round(clicks.length / views.length * 100) : 0,
      top_links,
      views_by_day,
      sources,
      devices,
    })
    setLoading(false)
  }, [pageId])

  return { summary, loading, fetch: fetchAnalytics }
}
