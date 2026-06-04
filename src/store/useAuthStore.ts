import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthState {
  user:         any | null
  profile:      Profile | null
  loading:      boolean
  setUser:      (user: any | null) => void
  setProfile:   (p: Profile | null) => void
  fetchProfile: (id: string) => Promise<void>
  signOut:      () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user:    null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user, loading: false }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async (id) => {
    const { data } = await supabase
      .from('profiles').select('*').eq('id', id).single()
    if (data) set({ profile: data as Profile })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
