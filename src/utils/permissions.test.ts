import { describe, expect, it } from "vitest"
import { canAccess, canPerform } from "@/utils/permissions"

describe("permissions", () => {
  it("allows tenant admins to access settings and manage catalog", () => {
    expect(canAccess("tenant_admin", "settings")).toBe(true)
    expect(canPerform("tenant_admin", "manageCatalog")).toBe(true)
  })

  it("prevents viewers from creating or editing quotes", () => {
    expect(canAccess("viewer", "quoteBuilder")).toBe(false)
    expect(canPerform("viewer", "sendQuote")).toBe(false)
    expect(canPerform("viewer", "downloadPdf")).toBe(true)
  })
})
