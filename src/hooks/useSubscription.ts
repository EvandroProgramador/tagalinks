import { useState, useCallback } from 'react'
import { initAppyPayPayment } from '@/lib/appypay'
import type { SubscriptionPlan, AppyPayInitResponse } from '@/types'
import toast from 'react-hot-toast'

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const [payData, setPayData] = useState<AppyPayInitResponse | null>(null)

  const startUpgrade = useCallback(async (profileId: string, plan: SubscriptionPlan) => {
    if (plan === 'free') return
    setLoading(true)
    try {
      const data = await initAppyPayPayment(profileId, plan)
      setPayData(data)
      return data
    } catch {
      toast.error('Erro ao iniciar pagamento. Tenta novamente.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const planLabel: Record<SubscriptionPlan, string> = {
    free:     'Gratuito',
    creator:  'Creator — 2 900 Kz/mês',
  }

  const planFeatures: Record<SubscriptionPlan, string[]> = {
    free: [
      '3 links',
      'Analytics básico',
      'Tema TAGATECH',
    ],
    creator: [
      'Links ilimitados',
      'Vídeo de apresentação',
      'Analytics completo',
      'Cores e fontes personalizadas',
      'TagaShop embutido',
    ],
  }

  return { loading, payData, startUpgrade, planLabel, planFeatures }
}
