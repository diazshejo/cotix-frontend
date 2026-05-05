import { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { LoadingState } from "@/components/common/StateBlock"
import { routes } from "@/constants/routes"
import { useAuthStore } from "@/stores/authStore"
import { canAccess, type Resource } from "@/utils/permissions"

export function ProtectedRoute({ children, resource }: { children: ReactNode; resource?: Resource }) {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const role = useAuthStore((state) => state.user?.role)

  if (status === "idle" || status === "checking") {
    return <LoadingState title="Validando sesion" />
  }

  if (status !== "authenticated") {
    return <Navigate to={routes.login} replace state={{ from: location.pathname }} />
  }

  if (resource && !canAccess(role, resource)) {
    return (
      <div className="surface rounded-lg p-8 text-center">
        <p className="label">Permisos</p>
        <h2 className="mt-2 text-xl font-bold">No tienes acceso a esta seccion</h2>
        <p className="mt-2 text-sm text-muted-foreground">Tu rol actual no permite ver o modificar este modulo.</p>
      </div>
    )
  }

  return children
}
