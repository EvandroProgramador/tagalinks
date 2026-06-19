import type { AppyPayInitResponse, BillingPeriod, SubscriptionPlan } from '@/types'

export const CREATOR_PRICES: Record<BillingPeriod, number> = {
  monthly:   2900,
  quarterly: 7800,
  annual:    27900,
}

const PERIOD_DESCRIPTION: Record<BillingPeriod, string> = {
  monthly:   '1 mês',
  quarterly: '3 meses',
  annual:    '1 ano',
}

export async function initAppyPayPayment(
  profileId: string,
  plan: SubscriptionPlan,
  period: BillingPeriod,
): Promise<AppyPayInitResponse> {
  const amount = plan === 'free' ? 0 : CREATOR_PRICES[period]
  const merchantId = import.meta.env.VITE_APPYPAY_MERCHANT_ID
  const apiUrl     = import.meta.env.VITE_APPYPAY_API_URL

  const res = await fetch(`${apiUrl}/v1/payments/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id:  merchantId,
      amount,
      currency:     'AOA',
      description:  `TagaLinks ${plan} — ${PERIOD_DESCRIPTION[period]}`,
      metadata: {
        profile_id: profileId,
        plan,
        period,
        product: 'tagalinks',
      },
      webhook_url:  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appypay-webhook`,
      redirect_url: `${import.meta.env.VITE_APP_URL}/dashboard/upgrade?success=1`,
    }),
  })

  if (!res.ok) throw new Error('AppyPay: erro ao iniciar pagamento')
  return res.json()
}

export async function checkAppyPayStatus(reference: string): Promise<{ status: string }> {
  const apiUrl = import.meta.env.VITE_APPYPAY_API_URL
  const res = await fetch(`${apiUrl}/v1/payments/status/${reference}`)
  if (!res.ok) throw new Error('AppyPay: erro ao verificar estado')
  return res.json()
}
