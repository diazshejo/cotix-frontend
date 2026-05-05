import { NavLink } from "react-router-dom"
import {
  BarChart3,
  Boxes,
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"
import { routes } from "@/constants/routes"
import { useAuthStore } from "@/stores/authStore"
import { cn } from "@/utils/cn"
import { canAccess, type Resource } from "@/utils/permissions"

const navigation = [
  { label: "Dashboard", href: routes.dashboard, icon: LayoutDashboard, resource: "dashboard" },
  { label: "Cotizaciones", href: routes.quotes, icon: FileText, resource: "quotes" },
  { label: "Clientes", href: routes.clients, icon: Users, resource: "clients" },
  { label: "Catalogo", href: routes.catalogItems, icon: Boxes, resource: "catalog" },
  { label: "Reportes", href: routes.reports, icon: BarChart3, resource: "reports" },
  { label: "Settings", href: routes.settingsCompany, icon: Settings, resource: "settings" },
]

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

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-border bg-slate-950 text-white lg:flex lg:flex-col">
      <SidebarBrand />

      <nav className="flex-1 space-y-1 px-3 py-5">
        <NavigationLinks />
      </nav>

      <div className="m-4 rounded-lg border border-white/10 bg-white/10 p-4">
        <p className="text-sm font-semibold">Plan Pro</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">38 de 250 cotizaciones usadas este mes.</p>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-2 w-[15%] rounded-full bg-cyan-400" />
        </div>
      </div>
    </aside>
  )
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button className="absolute inset-0 bg-slate-950/55" aria-label="Cerrar menu" onClick={onClose} />
      <aside className="relative h-full w-[min(86vw,320px)] border-r border-white/10 bg-slate-950 text-white shadow-soft">
        <SidebarBrand />
        <nav className="space-y-1 px-3 py-5">
          <NavigationLinks onNavigate={onClose} />
        </nav>
      </aside>
    </div>
  )
}
