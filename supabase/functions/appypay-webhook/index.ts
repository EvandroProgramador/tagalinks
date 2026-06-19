import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const body = await req.json()
  const { status, reference, order_id, amount, metadata } = body

  if (status !== 'paid') {
    return new Response(JSON.stringify({ ok: true, ignored: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { profile_id, plan, period } = metadata || {}
  if (!profile_id || !plan) {
    return new Response(JSON.stringify({ error: 'missing metadata' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const PERIOD_DAYS: Record<string, number> = {
    monthly:   30,
    quarterly: 90,
    annual:    365,
  }
  const days = PERIOD_DAYS[period as string] ?? 30

  const period_start = new Date()
  const period_end   = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  await supabase.from('subscriptions').insert({
    profile_id, plan,
    status: 'active',
    appypay_ref:      reference,
    appypay_order_id: order_id,
    amount,
    period_start,
    period_end,
  })

  await supabase.from('profiles').update({
    plan,
    sub_status:     'active',
    sub_expires_at: period_end.toISOString(),
  }).eq('id', profile_id)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
