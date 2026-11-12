export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "changes_requested" | "expired"

export type SignaturePoint = { x: number; y: number }
export type SignatureStrokes = SignaturePoint[][]

export interface QuoteAcceptance {
  signerName: string
  signedAt: string
  snapshotSha256: string
  signatureStrokes?: SignatureStrokes
}

export interface QuoteItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  discountRate: number
  taxRate: number
  taxable?: boolean
  unit?: string
  discountType?: "none" | "percent" | "fixed"
  discountValue?: number
  discountAmount?: number
  lineTotal?: number
}

export interface Quote {
  id: string
  clientId?: string
  number: string
  title?: string
  clientName: string
  clientEmail: string
  status: QuoteStatus
  issueDate: string
  validUntil: string
  total: number
  totals?: QuoteTotals
  taxRate?: number
  pricesIncludeTax?: boolean
  currency: "GTQ" | "USD"
  publicToken?: string
  notes?: string
  termsConditions?: string
  changeRequestMessage?: string
  revisionOf?: string | null
  revisionIds?: string[]
  acceptance?: QuoteAcceptance | null
  consentText?: string
  companyName?: string
  companyCity?: string
  companyDepartment?: string
  companyLogoUrl?: string
  companyPrimaryColor?: string
  companyWebsite?: string
  items: QuoteItem[]
}

export interface QuoteTotals {
  subtotal: number
  discount: number
  taxableSubtotal: number
  tax: number
  total: number
}
