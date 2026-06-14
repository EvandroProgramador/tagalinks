import type { AppyPayInitResponse, SubscriptionPlan } from '@/types'

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  free:     0,
  creator:  3900,
  business: 12000,
}

export async function initAppyPayPayment(
  profileId: string,
  plan: SubscriptionPlan,
): Promise<AppyPayInitResponse> {
  const amount = PLAN_PRICES[plan]
  const merchantId = import.meta.env.VITE_APPYPAY_MERCHANT_ID
  const apiUrl     = import.meta.env.VITE_APPYPAY_API_URL

  const res = await fetch(`${apiUrl}/v1/payments/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchant_id:  merchantId,
      amount,
      currency:     'AOA',
      description:  `TagaLinks ${plan} — 1 mês`,
      metadata: {
        profile_id: profileId,
        plan,
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
