import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

export type GoogleIntent = 'login' | 'register'

const GOOGLE_INTENT_KEY = 'tagalinks:google-intent'

/** Lê e limpa a intenção (login/cadastro) guardada antes do redirect para o Google. */
export function consumeGoogleIntent(): GoogleIntent {
  const stored = localStorage.getItem(GOOGLE_INTENT_KEY)
  localStorage.removeItem(GOOGLE_INTENT_KEY)
  return stored === 'register' ? 'register' : 'login'
}

/**
 * Inicia o fluxo de login/cadastro com Google via Supabase OAuth.
 * A intenção é guardada localmente para o callback saber se deve
 * criar conta (cadastro) ou apenas autenticar contas existentes (login).
 */
export async function signInWithGoogle(intent: GoogleIntent) {
  localStorage.setItem(GOOGLE_INTENT_KEY, intent)
  const result = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'select_account' },
    },
  })
  if (result.error) localStorage.removeItem(GOOGLE_INTENT_KEY)
  return result
}

/** Indica se já existe um perfil associado a este utilizador. */
export async function profileExists(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles').select('id').eq('id', userId).maybeSingle()
  return !!data
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
  if (await profileExists(user.id)) return

  const meta = user.user_metadata ?? {}
  const name: string =
    meta.full_name || meta.name || user.email?.split('@')[0] || 'Utilizador'
  const email = user.email ?? meta.email ?? ''
  const avatar = meta.avatar_url || meta.picture || undefined

  const username = await generateUniqueUsername(email.split('@')[0] || name)

  // O cadastro é feito pela função register_profile (SECURITY DEFINER):
  // é a única via autorizada para criar conta no servidor.
  const { error } = await supabase.rpc('register_profile', {
    p_name: name,
    p_username: username,
    p_avatar_url: avatar ?? null,
  })
  if (error) throw error
}
