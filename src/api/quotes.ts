import { apiClient, withMockFallback } from "@/api/client"
import { quotes } from "@/data/mock"
import type { Quote, QuoteItem, QuoteStatus } from "@/types/quote"

export interface QuoteListParams {
  search?: string
  status?: string
}

export interface QuoteItemDto {
  id: string | number
  name?: string
  description?: string
  quantity: number | string
  unit?: string
  unit_price: number | string
  discount_type?: "none" | "percent" | "fixed"
  discount_value?: number | string
  discount_amount?: number | string
  line_subtotal?: number | string
  line_total?: number | string
  discount_rate?: number | string
  tax_rate?: number | string
  taxable?: boolean
  catalog_item?: string | number | null
}

export interface QuoteDto {
  id: string | number
  number?: string
  quote_number?: string
  client: string | number | { id: string | number; name?: string; email?: string }
  client_name?: string
  client_email?: string
  status: QuoteStatus
  issue_date: string
  expiry_date?: string
  valid_until: string
  total: number | string
  currency: "GTQ" | "USD"
  public_token?: string
  title?: string
  notes?: string
  terms_conditions?: string
  subtotal?: number | string
  discount_total?: number | string
  taxable_base?: number | string
  total_tax?: number | string
  items: QuoteItemDto[]
}

export interface QuotePayloadDto {
  client: string | number
  title: string
  issue_date: string
  expiry_date: string
  currency: "GTQ" | "USD"
  notes?: string
  terms_conditions?: string
  items: {
    catalog_item?: string | number | null
    description: string
    quantity: number
    unit: string
    unit_price: number
    discount_type: "none" | "percent" | "fixed"
    discount_value: number
    taxable: boolean
  }[]
}

function mapQuoteItem(dto: QuoteItemDto): QuoteItem {
  const discountRate =
    dto.discount_type === "percent" ? Number(dto.discount_value ?? 0) / 100 : Number(dto.discount_rate ?? 0)

  return {
    id: String(dto.id),
    name: dto.name ?? dto.description ?? "Item",
    description: dto.description ?? "",
    quantity: Number(dto.quantity),
    unitPrice: Number(dto.unit_price),
    discountRate,
    taxRate: dto.taxable === false ? 0 : Number(dto.tax_rate ?? 0.12),
  }
}

function mapQuote(dto: QuoteDto): Quote {
  const clientId = typeof dto.client === "object" ? String(dto.client.id) : String(dto.client)
  const clientName =
    dto.client_name ?? (typeof dto.client === "object" ? dto.client.name : undefined) ?? `Cliente #${clientId}`
  const clientEmail = dto.client_email ?? (typeof dto.client === "object" ? dto.client.email : undefined) ?? ""

  return {
    id: String(dto.id),
    clientId,
    number: dto.quote_number ?? dto.number ?? String(dto.id),
    title: dto.title,
    clientName,
    clientEmail,
    status: dto.status,
    issueDate: dto.issue_date,
    validUntil: dto.expiry_date ?? dto.valid_until,
    total: Number(dto.total),
    currency: dto.currency,
    publicToken: dto.public_token,
    notes: dto.notes ?? "",
    termsConditions: dto.terms_conditions ?? "",
    items: dto.items.map(mapQuoteItem),
  }
}

function toQuotePayload(quote: Quote): QuotePayloadDto {
  return {
    client: quote.clientId ?? quote.clientName,
    title: quote.title || quote.number || "Cotizacion",
    issue_date: quote.issueDate,
    expiry_date: quote.validUntil,
    currency: quote.currency,
    notes: quote.notes ?? "",
    terms_conditions: quote.termsConditions ?? "",
    items: quote.items.map((item) => ({
      catalog_item: null,
      description: item.description,
      quantity: item.quantity,
      unit: "unidad",
      unit_price: item.unitPrice,
      discount_type: item.discountRate > 0 ? "percent" : "none",
      discount_value: item.discountRate * 100,
      taxable: item.taxRate > 0,
    })),
  }
}

export async function listQuotes(params: QuoteListParams = {}) {
  const response = apiClient.get<QuoteDto[]>("/quotes/", { params }).then((res) => res.data.map(mapQuote))
  return withMockFallback(response, quotes)
}

export async function getQuote(id: string) {
  const fallback = quotes.find((quote) => quote.id === id) ?? quotes[0]
  const response = apiClient.get<QuoteDto>(`/quotes/${id}/`).then((res) => mapQuote(res.data))
  return withMockFallback(response, fallback)
}

export async function getPublicQuote(token: string) {
  const response = apiClient.get<QuoteDto>(`/public/quotes/${token}/`).then((res) => mapQuote(res.data))
  return withMockFallback(response, quotes[0])
}

export async function saveQuote(payload: Quote) {
  const response = apiClient.post<QuoteDto>("/quotes/", toQuotePayload(payload)).then((res) => mapQuote(res.data))
  return withMockFallback(response, payload)
}

export async function sendQuote(id: string) {
  const response = apiClient.post<{ status?: QuoteStatus }>(`/quotes/${id}/send-email/`).then((res) => ({ ...quotes[0], id, status: res.data.status ?? "sent" as const }))
  return withMockFallback(response, { ...quotes[0], id, status: "sent" })
}

export async function downloadQuotePdf(id: string) {
  const response = await apiClient.get<Blob>(`/quotes/${id}/pdf/`, { responseType: "blob" })
  return response.data
}

export async function acceptPublicQuote(token: string) {
  const response = apiClient.post<{ status: QuoteStatus }>(`/public/quotes/${token}/respond/`, { response: "accepted" }).then(() => getPublicQuote(token))
  return withMockFallback(response, { ...quotes[0], status: "accepted" })
}

export async function rejectPublicQuote(token: string) {
  const response = apiClient.post<{ status: QuoteStatus }>(`/public/quotes/${token}/respond/`, { response: "rejected" }).then(() => getPublicQuote(token))
  return withMockFallback(response, { ...quotes[0], status: "rejected" })
}
