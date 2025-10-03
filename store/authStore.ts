import { create } from "zustand"

interface User {
  id: string
  username: string
  email: string
  profilePictureUrl?: string
  bio?: string
  loyaltyPoints: number
  level: "Bronze" | "Silver" | "Gold" | "Platinum"
  userType: "foodie" | "restaurant"
  restaurantId?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  token?: string
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setToken: (token: string | undefined) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: undefined,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, isAuthenticated: false, token: undefined }),
}))
