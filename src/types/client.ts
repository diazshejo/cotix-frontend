export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  nit?: string
  companyType: "company" | "person"
  totalQuoted: number
  quotesCount: number
  lastActivity: string
}
