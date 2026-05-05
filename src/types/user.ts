export type UserRole = "tenant_admin" | "seller" | "viewer" | "super_admin"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  tenantId: string
}
