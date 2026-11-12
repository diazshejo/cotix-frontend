import { afterEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/api/client"
import { listQuotes, saveQuote } from "@/api/quotes"
import type { Quote } from "@/types/quote"

const quote: Quote = {
  id: "", clientId: "client-1", number: "New", clientName: "Buyer", clientEmail: "buyer@example.com",
  status: "draft", issueDate: "2026-11-11", validUntil: "2026-11-30", total: 45,
  currency: "USD", items: [{
    id: "line-1", name: "Half hour", description: "", quantity: 0.5,
    unitPrice: 100, discountRate: 0, discountType: "fixed", discountValue: 5,
    taxable: true, taxRate: 0.12,
  }],
}

const response = {
  id: "quote-1", quote_number: "Q-1", client: "client-1", client_name: "Buyer",
  status: "draft", issue_date: "2026-11-11", expiry_date: "2026-11-30", currency: "USD",
  subtotal: "50.00", discount_total: "5.00", taxable_base: "40.18", total_tax: "4.82",
  total: "45.00", tax_rate_snapshot: "12.00", prices_include_tax_snapshot: true,
  items: [{
    id: "saved-line", description: "Half hour", quantity: "0.5000", unit: "hour",
    unit_price: "100.00", discount_type: "fixed", discount_value: "5.00",
    discount_amount: "5.00", line_total: "45.00", taxable: true,
  }],
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("saveQuote", () => {
  it("creates once and updates the saved quote with the correct fixed discount", async () => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: response })
    const patch = vi.spyOn(apiClient, "patch").mockResolvedValue({ data: response })

    const saved = await saveQuote(quote)
    expect(post).toHaveBeenCalledWith("/quotes/", expect.objectContaining({
      currency: "USD", items: [expect.objectContaining({
        quantity: 0.5, discount_type: "fixed", discount_value: 5,
      })],
    }))
    expect(saved.totals).toEqual({
      subtotal: 50, discount: 5, taxableSubtotal: 40.18, tax: 4.82, total: 45,
    })

    await saveQuote(saved)
    expect(patch).toHaveBeenCalledWith("/quotes/quote-1/", expect.objectContaining({
      items: [expect.objectContaining({ discount_type: "fixed", discount_value: 5 })],
    }))
    expect(post).toHaveBeenCalledTimes(1)
  })
})

describe("listQuotes", () => {
  it("preserves pagination metadata and requests the selected page", async () => {
    const get = vi.spyOn(apiClient, "get").mockResolvedValue({
      data: { count: 21, next: null, previous: "http://api.test/quotes/?page=1", results: [response] },
    })
    const result = await listQuotes({ page: 2, status: "draft" })
    expect(get).toHaveBeenCalledWith("/quotes/", { params: { page: 2, status: "draft" } })
    expect(result.count).toBe(21)
    expect(result.previous).toBeTruthy()
    expect(result.results[0].number).toBe("Q-1")
  })
})
