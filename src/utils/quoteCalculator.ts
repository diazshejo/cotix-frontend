import type { QuoteItem, QuoteTotals } from "@/types/quote"

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function calculateQuoteLineTotals(item: QuoteItem): QuoteTotals {
  const quantity = Math.max(1, safeNumber(item.quantity, 1))
  const unitPrice = Math.max(0, safeNumber(item.unitPrice))
  const discountRate = clamp(safeNumber(item.discountRate), 0, 1)
  const taxRate = clamp(safeNumber(item.taxRate), 0, 1)
  const subtotal = roundCurrency(quantity * unitPrice)
  const discount = roundCurrency(Math.min(subtotal, subtotal * discountRate))
  const taxableSubtotal = roundCurrency(Math.max(0, subtotal - discount))
  const tax = roundCurrency(Math.max(0, taxableSubtotal * taxRate))
  const total = roundCurrency(Math.max(0, taxableSubtotal + tax))

  return { subtotal, discount, taxableSubtotal, tax, total }
}

export function calculateQuoteTotals(items: QuoteItem[]): QuoteTotals {
  return items.reduce<QuoteTotals>(
    (totals, item) => {
      const lineTotals = calculateQuoteLineTotals(item)

      return {
        subtotal: roundCurrency(totals.subtotal + lineTotals.subtotal),
        discount: roundCurrency(totals.discount + lineTotals.discount),
        taxableSubtotal: roundCurrency(totals.taxableSubtotal + lineTotals.taxableSubtotal),
        tax: roundCurrency(totals.tax + lineTotals.tax),
        total: roundCurrency(totals.total + lineTotals.total),
      }
    },
    { subtotal: 0, discount: 0, taxableSubtotal: 0, tax: 0, total: 0 },
  )
}
