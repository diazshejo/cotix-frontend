export function formatCurrency(value: number, currency = "GTQ") {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}
