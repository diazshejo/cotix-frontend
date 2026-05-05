import { Link, useLocation } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { Bell, Menu, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { logout } from "@/api/auth"
import { Button } from "@/components/ui/Button"
import { useConfirm } from "@/components/common/ConfirmDialog"
import { routes } from "@/constants/routes"
import { useAuthStore } from "@/stores/authStore"
import { canPerform } from "@/utils/permissions"
import { publishSessionEvent } from "@/utils/sessionSync"

const titles: Record<string, string> = {
  [routes.dashboard]: "Dashboard",
  [routes.quotes]: "Cotizaciones",
  [routes.newQuote]: "Nueva cotizacion",
  [routes.clients]: "Clientes",
  [routes.catalogItems]: "Catalogo",
  [routes.reports]: "Reportes",
  [routes.settingsCompany]: "Configuracion",
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? "Cotix"
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const confirm = useConfirm()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession()
      publishSessionEvent("logout")
      toast.info("Sesion cerrada.")
    },
  })
  const canCreateQuote = canPerform(user?.role, "create")

  async function requestLogout() {
    const confirmed = await confirm({
      title: "Cerrar sesion",
      description: "Se cerrara tu sesion en esta pestana y en las demas donde Cotix este abierto.",
      confirmLabel: "Cerrar sesion",
      tone: "danger",
    })
    if (confirmed) logoutMutation.mutate()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/82 px-4 py-3 backdrop-blur xl:px-8">
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="h-10 w-10 px-0 lg:hidden" aria-label="Abrir menu" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="label">Cotix workspace</p>
          <h1 className="truncate text-xl font-bold text-foreground">{title}</h1>
        </div>

        <div className="hidden h-10 min-w-[280px] items-center gap-2 rounded-md border border-border bg-white px-3 opacity-70 md:flex" title="Busqueda global proximamente">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            disabled
            className="w-full border-0 bg-transparent text-sm outline-none"
            placeholder="Busqueda global proximamente"
          />
        </div>

        <Button variant="secondary" disabled className="hidden h-10 w-10 px-0 sm:inline-flex" aria-label="Notificaciones proximamente" title="Notificaciones proximamente">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="hidden min-w-0 text-right md:block">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <Button variant="ghost" loading={logoutMutation.isPending} onClick={requestLogout}>
          Salir
        </Button>
        {canCreateQuote ? (
          <Link
            to={routes.newQuote}
            className="focus-ring hidden h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92 sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Nueva
          </Link>
        ) : null}
      </div>
    </header>
  )
}
