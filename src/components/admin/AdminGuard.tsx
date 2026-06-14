import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-bg">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user || profile?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
