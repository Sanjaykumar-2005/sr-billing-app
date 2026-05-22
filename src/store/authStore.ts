import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { getActiveUsers, getUserSections, getUserSectionsForRole } from '@/lib/userSections'
import type { Role, Section, User } from '@/types'

interface AuthState {
  currentUser: User | null
  login: (userId: string) => void
  logout: () => void
  hasAccessTo: (section: Section) => boolean
  /** Dev-only: instantly switch to a mock user by role */
  setMockUser: (role: Role) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,

      login: (userId) => {
        const user = getActiveUsers().find((u) => u.id === userId) ?? null
        set({ currentUser: user })
      },

      logout: () => set({ currentUser: null }),

      hasAccessTo: (section) => {
        const { currentUser } = get()
        if (!currentUser) return false
        return getUserSections(currentUser.id).includes(section)
      },

      setMockUser: (role) => {
        const user = getActiveUsers().find((u) => u.role === role) ?? null
        set({ currentUser: user })
      },
    }),
    {
      name: 'billing-app-auth',
      // Persist the selected user; dynamic counter data is refreshed on login.
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
)

export { getUserSections, getUserSectionsForRole }
