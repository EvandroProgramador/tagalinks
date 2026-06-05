import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const body = await req.json()
  const { type, page_id, link_item_id, referrer, session_id } = body

  const ua = req.headers.get('user-agent') || ''
  const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop'

  let origin = 'direct'
  const ref = (referrer || req.headers.get('referer') || '').toLowerCase()
  if (ref.includes('instagram'))  origin = 'instagram'
  else if (ref.includes('tiktok'))     origin = 'tiktok'
  else if (ref.includes('whatsapp'))   origin = 'whatsapp'
  else if (ref.includes('facebook'))   origin = 'facebook'
  else if (ref.includes('twitter') || ref.includes('t.co')) origin = 'twitter'
  else if (ref.includes('youtube'))    origin = 'youtube'
  else if (ref.length > 0)            origin = 'other'

  if (type === 'page_view') {
    await supabase.from('page_views').insert({
      page_id, referrer: origin, device, session_id
    })
  } else if (type === 'link_click' && link_item_id) {
    await supabase.from('link_clicks').insert({
      link_item_id, page_id, session_id
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
