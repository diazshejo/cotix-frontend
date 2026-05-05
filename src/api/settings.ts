import { apiClient, withMockFallback } from "@/api/client"
import { companySettings } from "@/data/mock"
import type { CompanySettings } from "@/types/settings"

export interface CompanySettingsDto {
  business_name: string
  trade_name: string
  nit: string
  tax_regime: string
  email: string
  phone: string
  website?: string
  address_line1: string
  city: string
  department: string
  primary_color: string
  default_currency: "GTQ" | "USD"
  tax_label: string
  tax_rate: number | string
  quote_prefix: string
  quote_digits?: number
  default_footer_text: string
  default_terms?: string
}

function mapSettings(dto: CompanySettingsDto): CompanySettings {
  return {
    businessName: dto.business_name,
    tradeName: dto.trade_name,
    nit: dto.nit,
    taxRegime: dto.tax_regime,
    email: dto.email,
    phone: dto.phone,
    website: dto.website ?? "",
    addressLine1: dto.address_line1,
    city: dto.city,
    department: dto.department,
    brandColor: dto.primary_color,
    defaultCurrency: dto.default_currency,
    taxLabel: dto.tax_label,
    taxRate: Number(dto.tax_rate),
    quotePrefix: dto.quote_prefix,
    quoteDigits: dto.quote_digits ?? 4,
    footerText: dto.default_footer_text,
    defaultTerms: dto.default_terms ?? "",
  }
}

function toSettingsDto(settings: CompanySettings): CompanySettingsDto {
  return {
    business_name: settings.businessName,
    trade_name: settings.tradeName,
    nit: settings.nit,
    tax_regime: settings.taxRegime,
    email: settings.email,
    phone: settings.phone,
    website: settings.website,
    address_line1: settings.addressLine1,
    city: settings.city,
    department: settings.department,
    primary_color: settings.brandColor,
    default_currency: settings.defaultCurrency,
    tax_label: settings.taxLabel,
    tax_rate: settings.taxRate,
    quote_prefix: settings.quotePrefix,
    quote_digits: settings.quoteDigits,
    default_footer_text: settings.footerText,
    default_terms: settings.defaultTerms,
  }
}

export async function getCompanySettings() {
  const response = apiClient.get<CompanySettingsDto>("/tenant/settings/").then((res) => mapSettings(res.data))
  return withMockFallback(response, companySettings)
}

export async function updateCompanySettings(payload: CompanySettings) {
  const response = apiClient.put<CompanySettingsDto>("/tenant/settings/", toSettingsDto(payload)).then((res) => mapSettings(res.data))
  return withMockFallback(response, payload)
}
