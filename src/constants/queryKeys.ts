export const queryKeys = {
  dashboard: (period: string) => ["dashboard", period] as const,
  quotes: (filters: { search?: string; status?: string }) => ["quotes", filters] as const,
  quote: (id: string) => ["quote", id] as const,
  publicQuote: (token: string) => ["publicQuote", token] as const,
  clients: (search: string) => ["clients", search] as const,
  catalogItems: (search: string) => ["catalogItems", search] as const,
  companySettings: ["companySettings"] as const,
}
