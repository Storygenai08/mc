import { Config } from "@/constants/Config"
import { useAuthStore } from "@/store/authStore"

type LoginResponse = { token: string }
type User = import("@/store/authStore").User

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const state = useAuthStore.getState()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...(options.headers || {}),
  }
  const res = await fetch(`${Config.API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    async login(email: string, password: string) {
      const data = await request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      useAuthStore.getState().setToken(data.token)
      const me = await request<User>("/api/users/me")
      useAuthStore.getState().setUser(me as any)
    },
    async registerFoodie(username: string, email: string, password: string) {
      await request("/api/auth/register/foodie", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      })
      return this.login(email, password)
    },
    async registerRestaurant(username: string, email: string, password: string) {
      await request("/api/auth/register/restaurant", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      })
      return this.login(email, password)
    },
    async logout() {
      useAuthStore.getState().logout()
    },
    async me() {
      return request<User>("/api/users/me")
    },
  },
  users: {
    async follow(id: string) {
      return request(`/api/users/${id}/follow`, { method: "POST" })
    },
  },
  restaurants: {
    async nearby(lat: number, lon: number) {
      return request("/api/restaurants/nearby?lat=" + lat + "&lon=" + lon)
    },
    async get(id: string) {
      return request(`/api/restaurants/${id}`)
    },
  },
  reviews: {
    async listRecent() {
      return request("/api/reviews/recent")
    },
    async create(restaurantId: string, rating: number, reviewText: string, isPromoter?: boolean, photoUrls?: string[]) {
      return request(`/api/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, reviewText, isPromoter: !!isPromoter, photoUrls: photoUrls || [] }),
      })
    },
  },
  promotions: {
    async approve(reviewId: string, offerId: string) {
      return request(`/api/promotions/approve/${reviewId}`, {
        method: "POST",
        body: JSON.stringify({ offerId }),
      })
    },
    async redeem(encryptedCode: string) {
      return request("/api/promotions/redeem", { method: "POST", body: JSON.stringify({ encryptedCode }) })
    },
  },
}
