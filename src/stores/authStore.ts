import { create } from "zustand"
import type { AuthUser } from "@/types/user"

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  status: "idle" | "checking" | "authenticated" | "guest"
  setChecking: () => void
  setSession: (accessToken: string, user: AuthUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "idle",
  setChecking: () => set({ status: "checking" }),
  setSession: (accessToken, user) => set({ accessToken, user, status: "authenticated" }),
  clearSession: () => set({ accessToken: null, user: null, status: "guest" }),
}))
