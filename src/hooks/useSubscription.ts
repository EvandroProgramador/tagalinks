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
    creator:  'Creator — 5 000 Kz/mês',
    business: 'Business — 12 000 Kz/mês',
  }

  const planFeatures: Record<SubscriptionPlan, string[]> = {
    free: [
      'Até 5 links',
      'Vídeo YouTube de apresentação',
      'Analytics básico',
      'Tema TAGATECH padrão',
    ],
    creator: [
      'Links ilimitados',
      'Analytics completo com origens',
      'Personalização de cores e fontes',
      'Vídeo YouTube de apresentação',
      'Produtos TagaShop embutidos',
      'Subdomínio personalizado',
    ],
    business: [
      'Tudo do Creator',
      'Múltiplas páginas',
      'A/B testing de links',
      'TagaPay integrado',
      'Pixel de rastreio',
      'Domínio próprio',
      'API e integrações avançadas',
    ],
  }

  return { loading, payData, startUpgrade, planLabel, planFeatures }
}
