import { NavLink } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  BarChart3,
  Boxes,
  Building2,
  Cable,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { logout } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { getMonthlyQuotaUsage } from "@/api/quotes"
import { Button } from "@/components/ui/Button"
import { useConfirm } from "@/components/common/ConfirmDialog"
import { queryKeys } from "@/constants/queryKeys"
import { routes } from "@/constants/routes"
import { useAuthStore } from "@/stores/authStore"
import type { TenantPlan } from "@/types/user"
import { cn } from "@/utils/cn"
import { canAccess, type Resource } from "@/utils/permissions"
import { publishSessionEvent } from "@/utils/sessionSync"

const navigation = [
  { label: "Dashboard", href: routes.dashboard, icon: LayoutDashboard, resource: "dashboard" },
  { label: "Cotizaciones", href: routes.quotes, icon: FileText, resource: "quotes" },
  { label: "Clientes", href: routes.clients, icon: Users, resource: "clients" },
  { label: "Catalogo", href: routes.catalogItems, icon: Boxes, resource: "catalog" },
  { label: "Reportes", href: routes.reports, icon: BarChart3, resource: "reports" },
  { label: "Settings", href: routes.settingsCompany, icon: Settings, resource: "settings" },
  { label: "Equipo", href: routes.settingsTeam, icon: UserCog, resource: "team" },
  { label: "Facturacion", href: routes.settingsBilling, icon: CreditCard, resource: "settings" },
  { label: "Integraciones", href: routes.settingsIntegrations, icon: Cable, resource: "settings" },
]

const PLAN_LABELS: Record<TenantPlan, string> = {
  free: "Demo",
  basic: "Basico",
  premium: "Pro",
  business: "Business",
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const role = useAuthStore((state) => state.user?.role)
  const allowedNavigation = navigation.filter((item) => canAccess(role, item.resource as Resource))

  return (
    <>
      {allowedNavigation.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
              isActive && "bg-white text-slate-950 shadow-soft hover:bg-white hover:text-slate-950",
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

function SidebarBrand() {
  return (
    <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-6 py-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-400 text-slate-950">
        <Building2 className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold">Cotix</p>
        <p className="text-xs text-slate-400">Cotizador digital</p>
      </div>
    </div>
  )
}

function PlanWidget() {
  const plan = useAuthStore((state) => state.user?.tenantPlan ?? "free")
  const label = PLAN_LABELS[plan] ?? plan

  const { data } = useQuery({
    queryKey: queryKeys.planUsage,
    queryFn: getMonthlyQuotaUsage,
    enabled: plan === "basic",
    staleTime: 5 * 60 * 1000,
  })

  const limit = data?.monthly_quotes.limit ?? null
  const used = data?.monthly_quotes.used ?? 0
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0

  return (
    <div className="m-4 rounded-lg border border-white/10 bg-white/10 p-4">
      <p className="text-sm font-semibold">Plan {label}</p>
      {plan === "basic" && limit !== null ? (
        <>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {used} de {limit} cotizaciones usadas este mes.
          </p>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div
              className={cn("h-2 rounded-full transition-all", pct >= 90 ? "bg-rose-400" : "bg-cyan-400")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </>
      ) : (
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {plan === "free" ? "Periodo demo activo." : "Cotizaciones ilimitadas."}
        </p>
      )}
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-border bg-slate-950 text-white lg:flex lg:flex-col">
      <SidebarBrand />

      <nav className="flex-1 space-y-1 px-3 py-5">
        <NavigationLinks />
      </nav>

      <PlanWidget />
    </aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const confirm = useConfirm()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearSession()
      publishSessionEvent("logout")
      toast.info("Sesion cerrada.")
      onClose()
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  async function requestLogout() {
    const confirmed = await confirm({
      title: "Cerrar sesion",
      description: "Se cerrara tu sesion en esta pestana y en las demas donde Cotix este abierto.",
      confirmLabel: "Cerrar sesion",
      tone: "danger",
    })
    if (confirmed) logoutMutation.mutate()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button className="absolute inset-0 bg-slate-950/55" aria-label="Cerrar menu" onClick={onClose} />
      <aside className="safe-top relative flex h-full w-[min(86vw,320px)] flex-col border-r border-white/10 bg-slate-950 text-white shadow-soft">
        <SidebarBrand />
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <NavigationLinks onNavigate={onClose} />
        </nav>
        <div className="safe-bottom border-t border-white/10 p-4">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="mt-1 text-xs text-slate-400">{user?.role}</p>
          <Button variant="secondary" className="mt-4 w-full border-white/15 bg-white/10 text-white hover:bg-white/15" loading={logoutMutation.isPending} onClick={requestLogout}>
            Salir
          </Button>
        </div>
      </aside>
    </div>
  )
}
