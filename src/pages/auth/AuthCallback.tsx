import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { ensureProfile, profileExists, consumeGoogleIntent } from '@/lib/auth'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    async function finish() {
      const intent = consumeGoogleIntent()
      const { data, error } = await supabase.auth.getSession()
      const user = data.session?.user

      if (error || !user) {
        if (active) {
          toast.error('Não foi possível concluir o login. Tenta novamente.')
          navigate('/login', { replace: true })
        }
        return
      }

      // No login não criamos conta: se o email não tem perfil, barramos.
      if (intent === 'login' && !(await profileExists(user.id))) {
        await supabase.auth.signOut()
        if (active) {
          toast.error('Não existe nenhuma conta com este email. Cria uma conta primeiro.')
          navigate('/register', { replace: true })
        }
        return
      }

      try {
        await ensureProfile(user)
        if (active) navigate('/dashboard', { replace: true })
      } catch {
        if (active) {
          toast.error('Erro ao preparar a tua conta.')
          navigate('/login', { replace: true })
        }
      }
    }

    finish()
    return () => { active = false }
  }, [navigate])

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center bg-surface-bg overflow-hidden gap-6">
      <div className="glow-blob top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-500/20 animate-glow-pulse" />
      <Logo className="h-[110px] block relative" />
      <div className="relative flex items-center gap-3 text-gray-400">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        A concluir o login...
      </div>
    </div>
  )
}
