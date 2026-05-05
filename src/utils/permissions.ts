import type { UserRole } from "@/types/user"

export type Resource = "dashboard" | "quotes" | "quoteBuilder" | "clients" | "catalog" | "reports" | "settings"
export type Action =
  | "view"
  | "create"
  | "edit"
  | "sendQuote"
  | "downloadPdf"
  | "copyPublicLink"
  | "manageSettings"
  | "manageCatalog"
  | "manageClients"

const accessMatrix: Record<UserRole, Resource[]> = {
  tenant_admin: ["dashboard", "quotes", "quoteBuilder", "clients", "catalog", "reports", "settings"],
  super_admin: ["dashboard", "quotes", "quoteBuilder", "clients", "catalog", "reports", "settings"],
  seller: ["dashboard", "quotes", "quoteBuilder", "clients", "catalog", "reports"],
  viewer: ["dashboard", "quotes", "clients", "catalog", "reports"],
}

const actionMatrix: Record<UserRole, Action[]> = {
  tenant_admin: [
    "view",
    "create",
    "edit",
    "sendQuote",
    "downloadPdf",
    "copyPublicLink",
    "manageSettings",
    "manageCatalog",
    "manageClients",
  ],
  super_admin: [
    "view",
    "create",
    "edit",
    "sendQuote",
    "downloadPdf",
    "copyPublicLink",
    "manageSettings",
    "manageCatalog",
    "manageClients",
  ],
  seller: ["view", "create", "edit", "sendQuote", "downloadPdf", "copyPublicLink", "manageClients"],
  viewer: ["view", "downloadPdf", "copyPublicLink"],
}

export function canAccess(role: UserRole | undefined | null, resource: Resource) {
  if (!role) return false
  return accessMatrix[role].includes(resource)
}

export function canPerform(role: UserRole | undefined | null, action: Action) {
  if (!role) return false
  return actionMatrix[role].includes(action)
}

export function getDefaultRouteForRole(role: UserRole | undefined | null) {
  if (!role) return "/login"
  if (canAccess(role, "dashboard")) return "/app/dashboard"
  return "/login"
}
