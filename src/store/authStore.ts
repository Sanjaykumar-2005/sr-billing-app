import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { MOCK_USERS } from '@/lib/constants'
import type { Role, Section, User } from '@/types'
import { SECTION_ACCESS } from '@/types'

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
        const user = MOCK_USERS.find((u) => u.id === userId) ?? null
        set({ currentUser: user })
      },

      logout: () => set({ currentUser: null }),

      hasAccessTo: (section) => {
        const { currentUser } = get()
        if (!currentUser) return false
        return SECTION_ACCESS[currentUser.role].includes(section)
      },

      setMockUser: (role) => {
        const user = MOCK_USERS.find((u) => u.role === role) ?? null
        set({ currentUser: user })
      },
    }),
    {
      name: 'billing-app-auth',
      // Only persist the user id; re-hydrate the full object from MOCK_USERS
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
)
