import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next: Theme = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },
    }),
    {
      name: 'billing-app-theme',
      onRehydrateStorage: () => (state) => {
        // Apply the persisted theme class to <html> on initial load
        if (state) {
          document.documentElement.classList.toggle(
            'dark',
            state.theme === 'dark'
          )
        }
      },
    }
  )
)
