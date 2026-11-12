import { apiClient, credentialClient, withMockFallback } from "@/api/client"
import { quotes } from "@/data/mock"
import type { Quote, QuoteItem, QuoteStatus, SignatureStrokes } from "@/types/quote"

export interface QuoteListParams {
  search?: string
  status?: string
  page?: number
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
  client?: string | number | { id: string | number; name?: string; email?: string }
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
  change_request_message?: string
  revision_of?: string | null
  revision_ids?: string[]
  acceptance?: {
    signer_name: string
    signed_at: string
    snapshot_sha256: string
    signature_strokes?: SignatureStrokes
  } | null
  consent_text?: string
  subtotal?: number | string
  discount_total?: number | string
  taxable_base?: number | string
  total_tax?: number | string
  tax_rate_snapshot?: number | string
  prices_include_tax_snapshot?: boolean
  company_name?: string
  company_city?: string
  company_department?: string
  company_logo_url?: string
  company_primary_color?: string
  company_website?: string
  company_footer_text?: string
  items?: QuoteItemDto[]
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
    unit: dto.unit ?? "unidad",
    taxable: dto.taxable ?? true,
    discountType: dto.discount_type ?? "none",
    discountValue: Number(dto.discount_value ?? 0),
    discountAmount: Number(dto.discount_amount ?? 0),
    lineTotal: dto.line_total == null ? undefined : Number(dto.line_total),
    description: dto.description ?? "",
    quantity: Number(dto.quantity),
    unitPrice: Number(dto.unit_price),
    discountRate,
    taxRate: dto.taxable === false ? 0 : Number(dto.tax_rate ?? 0),
  }
}

function mapQuote(dto: QuoteDto): Quote {
  const clientId = dto.client == null ? "" : typeof dto.client === "object" ? String(dto.client.id) : String(dto.client)
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
    totals: dto.subtotal == null ? undefined : {
      subtotal: Number(dto.subtotal),
      discount: Number(dto.discount_total ?? 0),
      taxableSubtotal: Number(dto.taxable_base ?? 0),
      tax: Number(dto.total_tax ?? 0),
      total: Number(dto.total),
    },
    taxRate: Number(dto.tax_rate_snapshot ?? 0),
    pricesIncludeTax: dto.prices_include_tax_snapshot ?? false,
    currency: dto.currency,
    publicToken: dto.public_token,
    notes: dto.notes ?? "",
    termsConditions: dto.terms_conditions ?? "",
    changeRequestMessage: dto.change_request_message ?? "",
    revisionOf: dto.revision_of ?? null,
    revisionIds: dto.revision_ids ?? [],
    acceptance: dto.acceptance ? {
      signerName: dto.acceptance.signer_name,
      signedAt: dto.acceptance.signed_at,
      snapshotSha256: dto.acceptance.snapshot_sha256,
      signatureStrokes: dto.acceptance.signature_strokes,
    } : null,
    consentText: dto.consent_text ?? "",
    companyName: dto.company_name ?? "",
    companyCity: dto.company_city ?? "",
    companyDepartment: dto.company_department ?? "",
    companyLogoUrl: dto.company_logo_url ?? "",
    companyPrimaryColor: dto.company_primary_color ?? "",
    companyWebsite: dto.company_website ?? "",
    companyFooterText: dto.company_footer_text ?? "",
    items: (dto.items ?? []).map((item) => ({
      ...mapQuoteItem(item),
      taxRate: item.taxable === false ? 0 : Number(dto.tax_rate_snapshot ?? 0) / 100,
    })),
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
      description: item.name || item.description,
      quantity: item.quantity,
      unit: item.unit ?? "unidad",
      unit_price: item.unitPrice,
      discount_type: item.discountType === "fixed" ? "fixed" : item.discountRate > 0 ? "percent" : "none",
      discount_value: item.discountType === "fixed" ? item.discountValue ?? 0 : item.discountRate * 100,
      taxable: item.taxable ?? item.taxRate > 0,
    })),
  }
}

export async function listQuotes(params: QuoteListParams = {}) {
  const response = apiClient
    .get<{ count: number; next: string | null; previous: string | null; results: QuoteDto[] }>("/quotes/", { params })
    .then((res) => ({ ...res.data, results: res.data.results.map(mapQuote) }))
  return withMockFallback(response, { count: quotes.length, next: null, previous: null, results: quotes })
}

export async function getQuote(id: string) {
  const fallback = quotes.find((quote) => quote.id === id) ?? quotes[0]
  const response = apiClient.get<QuoteDto>(`/quotes/${id}/`).then((res) => mapQuote(res.data))
  return withMockFallback(response, fallback)
}

export async function getPublicQuote(token: string) {
  const response = credentialClient.get<QuoteDto>(`/public/quotes/${token}/`).then((res) => mapQuote(res.data))
  return withMockFallback(response, quotes[0])
}

export async function saveQuote(payload: Quote) {
  const request = payload.id
    ? apiClient.patch<QuoteDto>(`/quotes/${payload.id}/`, toQuotePayload(payload))
    : apiClient.post<QuoteDto>("/quotes/", toQuotePayload(payload))
  const response = request.then((res) => mapQuote(res.data))
  return withMockFallback(response, payload)
}

export async function sendQuote(id: string) {
  const response = apiClient.post<{ status?: QuoteStatus }>(`/quotes/${id}/send-email/`).then((res) => ({ ...quotes[0], id, status: res.data.status ?? "sent" as const }))
  return withMockFallback(response, { ...quotes[0], id, status: "sent" })
}

export async function publishQuote(id: string) {
  const response = apiClient.post<QuoteDto>(`/quotes/${id}/publish/`).then((res) => mapQuote(res.data))
  const fallback: Quote = { ...quotes[0], id, status: "sent" }
  return withMockFallback(response, fallback)
}

export async function duplicateQuote(id: string) {
  const response = await apiClient.post<QuoteDto>(`/quotes/${id}/duplicate/`)
  return mapQuote(response.data)
}

export async function downloadQuotePdf(id: string) {
  const response = await apiClient.get<Blob>(`/quotes/${id}/pdf/`, { responseType: "blob" })
  return response.data
}

export async function downloadPublicQuotePdf(token: string) {
  const response = await credentialClient.get<Blob>(`/public/quotes/${token}/pdf/`, { responseType: "blob" })
  return response.data
}

export async function acceptPublicQuote(token: string, signerName: string, signatureStrokes: SignatureStrokes) {
  const response = credentialClient.post<{ status: QuoteStatus }>(`/public/quotes/${token}/respond/`, {
    response: "accepted", signer_name: signerName, signature_strokes: signatureStrokes, consent: true,
  }).then(() => getPublicQuote(token))
  return withMockFallback(response, { ...quotes[0], status: "accepted" })
}

export async function rejectPublicQuote(token: string) {
  const response = credentialClient.post<{ status: QuoteStatus }>(`/public/quotes/${token}/respond/`, { response: "rejected" }).then(() => getPublicQuote(token))
  return withMockFallback(response, { ...quotes[0], status: "rejected" })
}

export async function requestPublicQuoteChanges(token: string, message: string) {
  const response = credentialClient.post<{ status: QuoteStatus }>(`/public/quotes/${token}/respond/`, {
    response: "changes_requested", message,
  }).then(() => getPublicQuote(token))
  return withMockFallback(response, { ...quotes[0], status: "changes_requested", changeRequestMessage: message })
}

export interface MonthlyQuotaUsage {
  monthly_quotes: {
    used: number
    limit: number | null
  }
}

export async function getMonthlyQuotaUsage(): Promise<MonthlyQuotaUsage> {
  const response = await apiClient.get<MonthlyQuotaUsage>("/quotes/plan-usage/")
  return response.data
}
