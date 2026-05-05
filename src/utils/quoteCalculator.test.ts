import { describe, expect, it } from "vitest"
import { calculateQuoteTotals } from "@/utils/quoteCalculator"
import type { QuoteItem } from "@/types/quote"

describe("calculateQuoteTotals", () => {
  it("calculates a 10 percent discount", () => {
    const items: QuoteItem[] = [
      {
        id: "1",
        name: "Servicio",
        description: "",
        quantity: 2,
        unitPrice: 100,
        discountRate: 0.1,
        taxRate: 0.12,
      },
    ]

    expect(calculateQuoteTotals(items)).toEqual({
      subtotal: 200,
      discount: 20,
      taxableSubtotal: 180,
      tax: 21.6,
      total: 201.6,
    })
  })

  it("allows a 100 percent discount without negative totals", () => {
    const items: QuoteItem[] = [
      {
        id: "1",
        name: "Servicio",
        description: "",
        quantity: 1,
        unitPrice: 16000,
        discountRate: 1,
        taxRate: 0.12,
      },
    ]

    expect(calculateQuoteTotals(items)).toEqual({
      subtotal: 16000,
      discount: 16000,
      taxableSubtotal: 0,
      tax: 0,
      total: 0,
    })
  })

  it("normalizes discounts greater than 100 percent", () => {
    const totals = calculateQuoteTotals([
      {
        id: "1",
        name: "Servicio",
        description: "",
        quantity: 1,
        unitPrice: 16000,
        discountRate: 9,
        taxRate: 0.12,
      },
    ])

    expect(totals.discount).toBe(16000)
    expect(totals.taxableSubtotal).toBe(0)
    expect(totals.tax).toBe(0)
    expect(totals.total).toBe(0)
  })

  it("never returns negative totals for invalid item values", () => {
    const totals = calculateQuoteTotals([
      {
        id: "1",
        name: "Servicio",
        description: "",
        quantity: -5,
        unitPrice: -16000,
        discountRate: -1,
        taxRate: 3,
      },
    ])

    expect(totals.subtotal).toBeGreaterThanOrEqual(0)
    expect(totals.discount).toBeGreaterThanOrEqual(0)
    expect(totals.taxableSubtotal).toBeGreaterThanOrEqual(0)
    expect(totals.tax).toBeGreaterThanOrEqual(0)
    expect(totals.total).toBeGreaterThanOrEqual(0)
  })
})
