import { useState, useCallback } from 'react'
import { initAppyPayPayment, CREATOR_PRICES } from '@/lib/appypay'
import type { BillingPeriod, SubscriptionPlan, AppyPayInitResponse } from '@/types'
import toast from 'react-hot-toast'

const PERIOD_MONTHS: Record<BillingPeriod, number> = {
  monthly:   1,
  quarterly: 3,
  annual:    12,
}

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const [payData, setPayData] = useState<AppyPayInitResponse | null>(null)

  const startUpgrade = useCallback(async (profileId: string, plan: SubscriptionPlan, period: BillingPeriod) => {
    if (plan === 'free') return
    setLoading(true)
    try {
      const data = await initAppyPayPayment(profileId, plan, period)
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
    creator:  'Creator',
  }

  const periodLabel: Record<BillingPeriod, string> = {
    monthly:   'Mensal',
    quarterly: 'Trimestral',
    annual:    'Anual',
  }

  const periodSuffix: Record<BillingPeriod, string> = {
    monthly:   '/mês',
    quarterly: '/trimestre',
    annual:    '/ano',
  }

  function creatorPrice(period: BillingPeriod) {
    return CREATOR_PRICES[period]
  }

  /** Preço equivalente por mês, arredondado, para o badge de poupança. */
  function creatorMonthly(period: BillingPeriod) {
    return Math.round(CREATOR_PRICES[period] / PERIOD_MONTHS[period])
  }

  /** Percentagem de desconto face ao preço mensal cheio. */
  function creatorDiscount(period: BillingPeriod) {
    if (period === 'monthly') return 0
    const full = CREATOR_PRICES.monthly * PERIOD_MONTHS[period]
    return Math.round((1 - CREATOR_PRICES[period] / full) * 100)
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

  return {
    loading, payData, startUpgrade,
    planLabel, planFeatures,
    periodLabel, periodSuffix,
    creatorPrice, creatorMonthly, creatorDiscount,
  }
}
