import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

/** Inicia o fluxo de login/cadastro com Google via Supabase OAuth. */
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    },
  })
}

/** Gera um username único a partir do nome/email do utilizador. */
async function generateUniqueUsername(seed: string): Promise<string> {
  const base = (slugify(seed).replace(/-/g, '_').slice(0, 24) || 'user')

  for (let attempt = 0; attempt < 50; attempt++) {
    const candidate = attempt === 0
      ? base
      : `${base}_${Math.random().toString(36).slice(2, 6)}`

    const { data } = await supabase
      .from('profiles').select('id').eq('username', candidate).maybeSingle()

    if (!data) return candidate
  }

  return `user_${Date.now().toString(36)}`
}

/**
 * Garante que existe um perfil + página de links para o utilizador autenticado.
 * Usado após o login com Google, em que o utilizador não passa pelo formulário
 * de cadastro tradicional.
 */
export async function ensureProfile(user: User) {
  const { data: existing } = await supabase
    .from('profiles').select('id').eq('id', user.id).maybeSingle()

  if (existing) return

  const meta = user.user_metadata ?? {}
  const name: string =
    meta.full_name || meta.name || user.email?.split('@')[0] || 'Utilizador'
  const email = user.email ?? meta.email ?? ''
  const avatar = meta.avatar_url || meta.picture || undefined

  const username = await generateUniqueUsername(email.split('@')[0] || name)

  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: user.id,
    name,
    email,
    username,
    avatar_url: avatar,
    plan: 'free',
    role: 'user',
  })
  if (profileErr) throw profileErr

  await supabase.from('link_pages').insert({
    profile_id: user.id,
    slug: username,
    title: name,
    published: false,
  })
}
