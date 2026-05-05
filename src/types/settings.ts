export interface CompanySettings {
  businessName: string
  tradeName: string
  nit: string
  taxRegime: string
  email: string
  phone: string
  website?: string
  addressLine1: string
  city: string
  department: string
  brandColor: string
  defaultCurrency: "GTQ" | "USD"
  taxLabel: string
  taxRate: number
  quotePrefix: string
  quoteDigits: number
  footerText: string
  defaultTerms: string
}
