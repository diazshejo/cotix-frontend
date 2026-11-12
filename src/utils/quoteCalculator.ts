import type { QuoteItem, QuoteTotals } from "@/types/quote"

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function safeNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function calculateQuoteLineTotals(item: QuoteItem, taxRate = item.taxRate, pricesIncludeTax = false): QuoteTotals {
  const quantity = Math.max(0.0001, safeNumber(item.quantity, 1))
  const unitPrice = Math.max(0, safeNumber(item.unitPrice))
  const rate = clamp(safeNumber(taxRate), 0, 1)
  const subtotal = roundCurrency(quantity * unitPrice)
  const discount = item.discountType === "fixed"
    ? Math.min(subtotal, roundCurrency(Math.max(0, safeNumber(item.discountValue ?? 0))))
    : roundCurrency(subtotal * clamp(safeNumber(item.discountRate), 0, 1))
  const afterDiscount = roundCurrency(subtotal - discount)
  const taxableGross = (item.taxable ?? item.taxRate > 0) ? afterDiscount : 0
  const taxableSubtotal = pricesIncludeTax ? roundCurrency(taxableGross / (1 + rate)) : taxableGross
  const tax = pricesIncludeTax
    ? roundCurrency(taxableGross - taxableSubtotal)
    : roundCurrency(taxableSubtotal * rate)
  const total = pricesIncludeTax ? afterDiscount : roundCurrency(afterDiscount + tax)

  return { subtotal, discount, taxableSubtotal, tax, total }
}

export function calculateQuoteTotals(items: QuoteItem[], taxRate?: number, pricesIncludeTax = false): QuoteTotals {
  const lines = items.map((item) => calculateQuoteLineTotals(item, taxRate ?? item.taxRate, pricesIncludeTax))
  const subtotal = roundCurrency(lines.reduce((sum, line) => sum + line.subtotal, 0))
  const discount = roundCurrency(lines.reduce((sum, line) => sum + line.discount, 0))
  const taxableGross = roundCurrency(items.reduce((sum, item, index) =>
    sum + ((item.taxable ?? item.taxRate > 0) ? lines[index].subtotal - lines[index].discount : 0), 0))
  const taxableSubtotal = pricesIncludeTax && taxRate !== undefined
    ? roundCurrency(taxableGross / (1 + clamp(taxRate, 0, 1)))
    : roundCurrency(lines.reduce((sum, line) => sum + line.taxableSubtotal, 0))
  const tax = taxRate !== undefined
    ? pricesIncludeTax
      ? roundCurrency(taxableGross - taxableSubtotal)
      : roundCurrency(taxableSubtotal * clamp(taxRate, 0, 1))
    : roundCurrency(lines.reduce((sum, line) => sum + line.tax, 0))
  const total = roundCurrency(subtotal - discount + (pricesIncludeTax ? 0 : tax))

  return { subtotal, discount, taxableSubtotal, tax, total }
}
