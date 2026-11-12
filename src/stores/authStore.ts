import { queryClient } from "@/queryClient"
import { create } from "zustand"
import type { AuthUser } from "@/types/user"

interface AuthState {
  user: AuthUser | null
  status: "idle" | "checking" | "authenticated" | "guest"
  setChecking: () => void
  setSession: (user: AuthUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  setChecking: () => set({ status: "checking" }),
  setSession: (user) => {
    queryClient.clear()
    set({ user, status: "authenticated" })
  },
  clearSession: () => {
    queryClient.clear()
    set({ user: null, status: "guest" })
  },
}))
