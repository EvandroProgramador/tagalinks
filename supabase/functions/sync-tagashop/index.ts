import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { page_id, tagashop_slug } = await req.json()

  const tagashopUrl = Deno.env.get('TAGASHOP_API_URL') || 'https://tagashop.ao'
  const res = await fetch(`${tagashopUrl}/api/store/${tagashop_slug}/products`)
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'tagashop_unavailable' }), { status: 502 })
  }
  const products = await res.json()

  for (const p of products) {
    await supabase.from('link_items')
      .update({
        label:             p.name,
        url:               `https://tagashop.ao/p/${p.id}`,
        product_price:     p.price,
        product_image_url: p.cover_url,
        updated_at:        new Date().toISOString(),
      })
      .eq('page_id', page_id)
      .eq('tagashop_product_id', p.id)
  }

  return new Response(JSON.stringify({ ok: true, synced: products.length }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
})
