import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AnalyticsSummary } from '@/types'

export function useAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async (pageId: string, days = 30) => {
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

    // clicks por link
    const clicksByItem: Record<string, number> = {}
    for (const c of clicks) {
      clicksByItem[c.link_item_id] = (clicksByItem[c.link_item_id] || 0) + 1
    }

    const top_links = items
      .map((i) => ({
        id:     i.id,
        label:  i.label,
        clicks: clicksByItem[i.id] || 0,
        ctr:    views.length
          ? Math.min(100, Math.round((clicksByItem[i.id] || 0) / views.length * 100))
          : 0,
      }))
      .filter((i) => i.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)

    // gera todos os dias do intervalo com zeros
    const byDay: Record<string, { views: number; clicks: number }> = {}
    for (let d = 0; d < days; d++) {
      const date = new Date(Date.now() - (days - 1 - d) * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 10)
      byDay[date] = { views: 0, clicks: 0 }
    }
    for (const v of views) {
      const d = v.created_at.slice(0, 10)
      if (byDay[d]) byDay[d].views++
    }
    for (const c of clicks) {
      const d = c.created_at.slice(0, 10)
      if (byDay[d]) byDay[d].clicks++
    }
    const views_by_day = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }))

    // origens
    const srcCount: Record<string, number> = {}
    for (const v of views) {
      const src = v.referrer || 'direct'
      srcCount[src] = (srcCount[src] || 0) + 1
    }
    const sources = Object.entries(srcCount)
      .map(([source, count]) => ({
        source: source as any,
        count,
        pct: Math.round(count / (views.length || 1) * 100),
      }))
      .sort((a, b) => b.count - a.count)

    // dispositivos
    const devCount: Record<string, number> = {}
    for (const v of views) {
      const dev = v.device || 'mobile'
      devCount[dev] = (devCount[dev] || 0) + 1
    }
    const devices = Object.entries(devCount).map(([device, count]) => ({ device: device as any, count }))

    setSummary({
      total_views:  views.length,
      total_clicks: clicks.length,
      total_sales:  0,
      click_rate:   views.length
        ? Math.min(100, Math.round(clicks.length / views.length * 100))
        : 0,
      top_links,
      views_by_day,
      sources,
      devices,
    })
    setLoading(false)
  }, [])

  return { summary, loading, fetch }
}
