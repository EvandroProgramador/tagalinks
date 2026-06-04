import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SubscriptionPlan } from '@/types'
import type { ReactNode } from 'react'

interface Props {
  requiredPlan: SubscriptionPlan
  currentPlan:  SubscriptionPlan
  children:     ReactNode
  featureName?: string
}

const planOrder: SubscriptionPlan[] = ['free', 'creator', 'business']

export function UpgradeGate({ requiredPlan, currentPlan, children, featureName }: Props) {
  const hasAccess = planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan)
  if (hasAccess) return <>{children}</>

  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-surface-card/80 backdrop-blur-sm rounded-xl">
        <div className="text-center px-4">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5 text-brand-400" />
          </div>
          <p className="text-sm font-medium text-white mb-1">
            {featureName ? `${featureName} requer plano ${requiredPlan}` : `Disponível no plano ${requiredPlan}`}
          </p>
          <Link to="/dashboard/upgrade" className="text-xs text-brand-400 hover:text-brand-300 underline">
            Fazer upgrade
          </Link>
        </div>
      </div>
    </div>
  )
}
