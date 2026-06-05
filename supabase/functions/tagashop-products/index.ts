import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { store_slug } = await req.json()
    if (!store_slug) return json({ error: 'store_slug required' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Buscar a API key da loja pelo slug guardado no perfil TagaLinks
    const { data: profile } = await supabase
      .from('profiles')
      .select('tagashop_api_key')
      .eq('tagashop_slug', store_slug)
      .maybeSingle()

    if (!profile?.tagashop_api_key) return json({ error: 'store_not_found' }, 404)

    const TAGASHOP_URL      = Deno.env.get('TAGASHOP_API_URL')  || 'https://tagashop.site'
    const TAGASHOP_ANON_KEY = Deno.env.get('TAGASHOP_ANON_KEY') || ''

    const res = await fetch(`${TAGASHOP_URL}/functions/v1/tagalinks-catalog`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TAGASHOP_ANON_KEY ? { Authorization: `Bearer ${TAGASHOP_ANON_KEY}` } : {}),
      },
      body: JSON.stringify({ api_key: profile.tagashop_api_key }),
    })

    const catalog = await res.json()
    return json(catalog, res.ok ? 200 : res.status)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500)
  }
})
