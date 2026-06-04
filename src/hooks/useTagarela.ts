import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function useTagarela() {
  const [loading, setLoading] = useState(false)

  async function connectTagarela(profileId: string, botId: string) {
    setLoading(true)
    try {
      const { error } = await supabase.from('integrations').upsert({
        profile_id: profileId,
        type: 'tagarela',
        config: { bot_id: botId },
        active: true,
      }, { onConflict: 'profile_id,type' })

      if (error) { toast.error('Erro ao conectar Tagarela'); return false }

      await supabase.from('profiles').update({ tagarela_enabled: true, tagarela_bot_id: botId })
        .eq('id', profileId)

      toast.success('Tagarela conectado com sucesso!')
      return true
    } finally {
      setLoading(false)
    }
  }

  async function disconnectTagarela(profileId: string) {
    setLoading(true)
    try {
      await supabase.from('integrations').update({ active: false })
        .eq('profile_id', profileId).eq('type', 'tagarela')
      await supabase.from('profiles').update({ tagarela_enabled: false })
        .eq('id', profileId)
      toast.success('Tagarela desconectado')
      return true
    } finally {
      setLoading(false)
    }
  }

  const tagarelaBotUrl = import.meta.env.VITE_TAGARELA_SIGNUP_URL || 'https://tagarela.app/cadastro'

  return { loading, connectTagarela, disconnectTagarela, tagarelaBotUrl }
}
