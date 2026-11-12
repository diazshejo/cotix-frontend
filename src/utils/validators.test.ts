import { describe, expect, it } from "vitest"
import { companySettingsSchema, loginSchema, quoteSchema } from "@/utils/validators"

describe("validators", () => {
  it("rejects invalid login credentials", () => {
    const result = loginSchema.safeParse({ email: "ventas", password: "123" })
    expect(result.success).toBe(false)
  })

  it("requires at least one quote item", () => {
    const result = quoteSchema.safeParse({
      clientName: "Cliente Demo",
      title: "Cotizacion",
      issueDate: "2026-05-03",
      validUntil: "2026-05-15",
      items: [],
      notes: "",
    })

    expect(result.success).toBe(false)
  })

  it("allows empty optional company text but bounds public footer length", () => {
    const textSchema = companySettingsSchema.pick({ footerText: true, defaultTerms: true })
    expect(textSchema.safeParse({ footerText: "", defaultTerms: "" }).success).toBe(true)
    expect(textSchema.safeParse({ footerText: "x".repeat(2001), defaultTerms: "" }).success).toBe(false)
  })
})
