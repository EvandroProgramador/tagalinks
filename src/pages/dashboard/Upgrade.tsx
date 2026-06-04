import { useState } from 'react'
import { Check, Zap, Building2, QrCode, Copy, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import type { SubscriptionPlan } from '@/types'
import toast from 'react-hot-toast'

export default function Upgrade() {
  const { profile }  = useAuth()
  const { loading, payData, startUpgrade, planLabel, planFeatures } = useSubscription()
  const [copied, setCopied]    = useState(false)
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null)

  const currentPlan = profile?.plan || 'free'

  async function handleUpgrade(plan: SubscriptionPlan) {
    if (!profile?.id) return
    setSelected(plan)
    const data = await startUpgrade(profile.id, plan)
    if (!data) setSelected(null)
  }

  function copyRef() {
    if (!payData?.reference) return
    navigator.clipboard.writeText(payData.reference)
    setCopied(true)
    toast.success('Referência copiada!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (payData && selected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-tagatech mx-auto flex items-center justify-center">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Pagamento via AppyPay</h2>
            <p className="text-gray-400 text-sm mt-1">Plano {planLabel[selected]}</p>
          </div>

          <div className="bg-surface-elevated rounded-xl p-4 space-y-3 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Referência de pagamento</p>
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono font-bold text-white tracking-widest flex-1">
                {payData.reference}
              </code>
              <button onClick={copyRef}
                      className="p-2 rounded-lg bg-surface-card hover:bg-surface-hover transition-colors">
                {copied
                  ? <CheckCircle className="w-4 h-4 text-green-400" />
                  : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Valor:</span>
              <span className="text-white font-medium">{new Intl.NumberFormat('pt-PT').format(payData.amount)} Kz</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Válido até:</span>
              <span className="text-white">{new Date(payData.expires_at).toLocaleDateString('pt-PT')}</span>
            </div>
          </div>

          {payData.qr_code && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Ou paga via Multicaixa Express</p>
              <img src={payData.qr_code} alt="QR Code" className="w-40 h-40 mx-auto rounded-xl" />
            </div>
          )}

          <div className="text-xs text-gray-500 bg-surface-elevated rounded-xl p-3">
            Após o pagamento, o teu plano é actualizado automaticamente em segundos.
            Podes pagar no ATM, Homebanking ou app do teu banco com a referência acima.
          </div>

          <button onClick={() => setSelected(null)} className="btn-ghost text-sm w-full">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Escolhe o teu plano</h1>
        <p className="text-gray-400 mt-2">Paga em Kwanza via Multicaixa ou AppyPay</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(['free', 'creator', 'business'] as SubscriptionPlan[]).map((plan) => {
          const isCurrent = currentPlan === plan
          const isCreator = plan === 'creator'
          return (
            <div key={plan}
                 className={`card relative flex flex-col ${isCreator ? 'border-brand-500/50 ring-1 ring-brand-500/30' : ''}`}>
              {isCreator && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge bg-gradient-tagatech text-white text-xs px-3 py-1">Mais popular</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-1">
                {plan === 'free'     && <span className="text-gray-400 font-medium">Gratuito</span>}
                {plan === 'creator'  && <><Zap className="w-4 h-4 text-brand-400" /><span className="text-white font-semibold">Creator</span></>}
                {plan === 'business' && <><Building2 className="w-4 h-4 text-accent-400" /><span className="text-white font-semibold">Business</span></>}
              </div>

              <div className="mb-4">
                {plan === 'free'     && <p className="text-3xl font-bold text-white">0 Kz</p>}
                {plan === 'creator'  && <p className="text-3xl font-bold text-white">5 000 <span className="text-base font-normal text-gray-400">Kz/mês</span></p>}
                {plan === 'business' && <p className="text-3xl font-bold text-white">12 000 <span className="text-base font-normal text-gray-400">Kz/mês</span></p>}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {planFeatures[plan].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="btn-secondary text-center text-sm py-2.5 cursor-default opacity-60">Plano actual</div>
              ) : plan === 'free' ? (
                <div className="btn-ghost text-center text-sm py-2.5 cursor-default">Sempre grátis</div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loading && selected === plan}
                  className="btn-primary w-full text-sm py-2.5">
                  {loading && selected === plan ? 'A processar...' : 'Fazer upgrade'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-500 mt-6">
        Pagamentos seguros via AppyPay · Multicaixa Express · Referência ATM
      </p>
    </div>
  )
}
