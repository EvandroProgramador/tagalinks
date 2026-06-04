import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

export function useAuth() {
  const { user, profile, loading, setUser, fetchProfile, signOut } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, profile, loading, signOut, plan: profile?.plan ?? 'free' }
}
