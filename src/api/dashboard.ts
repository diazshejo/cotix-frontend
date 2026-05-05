import { apiClient, withMockFallback } from "@/api/client"
import { dashboardMetrics } from "@/data/mock"
import type { DashboardMetrics } from "@/types/dashboard"
import type { QuoteDto } from "@/api/quotes"

interface DashboardMetricsDto {
  total_quoted: number
  total_accepted: number
  conversion_rate: number
  quotes_created: number
  quotes_sent: number
  quotes_accepted: number
  quotes_rejected: number
  avg_quote_value: number
  recent_quotes: QuoteDto[]
  expiring_quotes: QuoteDto[]
  top_items: {
    item_name: string
    times_quoted: number
    total_amount: number
  }[]
  conversion_series: {
    month: string
    sent: number
    accepted: number
    rate: number
  }[]
}

function mapQuoteSummary(dto: QuoteDto) {
  return {
    id: String(dto.id),
    number: dto.quote_number ?? dto.number ?? String(dto.id),
    clientName: dto.client_name ?? (typeof dto.client === "object" ? dto.client.name : undefined) ?? `Cliente #${String(dto.client)}`,
    clientEmail: dto.client_email ?? (typeof dto.client === "object" ? dto.client.email : undefined) ?? "",
    status: dto.status,
    issueDate: dto.issue_date,
    validUntil: dto.expiry_date ?? dto.valid_until,
    total: Number(dto.total),
    currency: dto.currency,
    publicToken: dto.public_token,
    items: [],
  }
}

function mapDashboard(dto: DashboardMetricsDto): DashboardMetrics {
  return {
    totalQuoted: dto.total_quoted,
    totalAccepted: dto.total_accepted,
    conversionRate: dto.conversion_rate,
    quotesCreated: dto.quotes_created,
    quotesSent: dto.quotes_sent,
    quotesAccepted: dto.quotes_accepted,
    quotesRejected: dto.quotes_rejected,
    avgQuoteValue: dto.avg_quote_value,
    recentQuotes: dto.recent_quotes.map(mapQuoteSummary),
    expiringQuotes: dto.expiring_quotes.map(mapQuoteSummary),
    topItems: dto.top_items.map((item) => ({
      itemName: item.item_name,
      timesQuoted: item.times_quoted,
      totalAmount: item.total_amount,
    })),
    conversionSeries: dto.conversion_series,
  }
}

export async function getDashboardMetrics(period = "month") {
  const response = apiClient.get<DashboardMetricsDto>("/reports/dashboard/", { params: { period } }).then((res) => mapDashboard(res.data))
  return withMockFallback(response, dashboardMetrics)
}
