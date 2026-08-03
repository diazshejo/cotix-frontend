export type UserRole = "tenant_admin" | "seller" | "viewer" | "super_admin"

export type TenantPlan = "free" | "basic" | "premium" | "business"

export type TenantStatus = "demo" | "active" | "suspended" | "cancelled"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  tenantId: string
  tenantPlan: TenantPlan
  tenantStatus: TenantStatus
}

export interface TeamMember {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
}
