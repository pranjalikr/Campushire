import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: number
  email: string
  full_name: string
  profile_completed: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  adminId: number | null
  setAuth: (user: User, token: string) => void
  adminLogin: (adminId: number) => void
  adminLogout: () => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      adminId: null,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, isAdmin: false, adminId: null }),
      adminLogin: (adminId) =>
        set({ isAdmin: true, adminId }),
      adminLogout: () =>
        set({ isAdmin: false, adminId: null }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false, adminId: null }),
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
