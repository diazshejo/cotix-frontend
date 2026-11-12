import { ReactNode, useEffect } from "react"
import { getMe, refreshSession } from "@/api/auth"
import { setUnauthorizedHandler } from "@/api/client"
import { useAuthStore } from "@/stores/authStore"
import { publishSessionEvent, subscribeSessionEvents } from "@/utils/sessionSync"
import { toast } from "sonner"

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const setChecking = useAuthStore((state) => state.setChecking)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    let cancelled = false

    setUnauthorizedHandler(() => {
      clearSession()
      publishSessionEvent("expired")
      toast.error("Tu sesion vencio. Inicia sesion nuevamente.")
    })

    async function boot() {
      setChecking()
      try {
        await refreshSession()
        const user = await getMe()
        if (!cancelled) setSession(user)
      } catch {
        if (!cancelled) clearSession()
      }
    }

    void boot()
    const unsubscribe = subscribeSessionEvents((event) => {
      if (event === "logout" || event === "expired") {
        clearSession()
        if (event === "expired") toast.error("Tu sesion vencio en otra pestana.")
      }
      if (event === "login") void boot()
    })

    return () => {
      cancelled = true
      setUnauthorizedHandler(null)
      unsubscribe()
    }
  }, [clearSession, setChecking, setSession])

  return children
}
