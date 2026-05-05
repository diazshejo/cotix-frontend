import type { Quote } from "@/types/quote"

export interface DashboardMetrics {
  totalQuoted: number
  totalAccepted: number
  conversionRate: number
  quotesCreated: number
  quotesSent: number
  quotesAccepted: number
  quotesRejected: number
  avgQuoteValue: number
  recentQuotes: Quote[]
  expiringQuotes: Quote[]
  topItems: {
    itemName: string
    timesQuoted: number
    totalAmount: number
  }[]
  conversionSeries: {
    month: string
    sent: number
    accepted: number
    rate: number
  }[]
}
