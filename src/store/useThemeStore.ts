import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  dark: boolean
  toggleDark: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: true,
      toggleDark: () => set((s) => ({ dark: !s.dark })),
    }),
    { name: 'tagalinks-theme' },
  ),
)
