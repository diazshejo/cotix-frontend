import type { Quote } from "@/types/quote"
import type { CatalogItem } from "@/types/catalog"
import type { Client } from "@/types/client"
import type { DashboardMetrics } from "@/types/dashboard"
import type { CompanySettings } from "@/types/settings"

export const quotes: Quote[] = [
  {
    id: "1",
    number: "COT-2026-0047",
    clientName: "Constructora del Norte S.A.",
    clientEmail: "compras@cdnorte.gt",
    status: "viewed",
    issueDate: "2026-05-03",
    validUntil: "2026-05-18",
    total: 16229,
    currency: "GTQ",
    items: [
      {
        id: "i1",
        name: "Licencia Cotix Pro",
        description: "Suscripcion anual con usuarios comerciales incluidos.",
        quantity: 1,
        unitPrice: 8900,
        discountRate: 0.05,
        taxRate: 0.12,
      },
      {
        id: "i2",
        name: "Implementacion inicial",
        description: "Configuracion de marca, catalogo y plantillas comerciales.",
        quantity: 1,
        unitPrice: 5590,
        discountRate: 0,
        taxRate: 0.12,
      },
    ],
  },
  {
    id: "2",
    number: "COT-2026-0046",
    clientName: "Distribuidora Garcia",
    clientEmail: "roberto@garcia.gt",
    status: "accepted",
    issueDate: "2026-05-01",
    validUntil: "2026-05-12",
    total: 8420,
    currency: "GTQ",
    items: [],
  },
  {
    id: "3",
    number: "COT-2026-0045",
    clientName: "Clinica Altavista",
    clientEmail: "admin@altavista.gt",
    status: "sent",
    issueDate: "2026-04-29",
    validUntil: "2026-05-06",
    total: 23100,
    currency: "GTQ",
    items: [],
  },
]

export const dashboardSeries = [
  { month: "Ene", sent: 18, accepted: 9, rate: 50 },
  { month: "Feb", sent: 24, accepted: 13, rate: 54 },
  { month: "Mar", sent: 31, accepted: 18, rate: 58 },
  { month: "Abr", sent: 28, accepted: 17, rate: 61 },
  { month: "May", sent: 12, accepted: 8, rate: 67 },
]

export const clients: Client[] = [
  {
    id: "c1",
    name: "Constructora del Norte S.A.",
    email: "compras@cdnorte.gt",
    phone: "+502 2222-1111",
    nit: "9822113-4",
    companyType: "company",
    totalQuoted: 16229,
    quotesCount: 3,
    lastActivity: "2026-05-03",
  },
  {
    id: "c2",
    name: "Distribuidora Garcia",
    email: "roberto@garcia.gt",
    phone: "+502 7765-4321",
    nit: "1234567-8",
    companyType: "company",
    totalQuoted: 8420,
    quotesCount: 1,
    lastActivity: "2026-05-01",
  },
  {
    id: "c3",
    name: "Clinica Altavista",
    email: "admin@altavista.gt",
    phone: "+502 2333-9090",
    companyType: "company",
    totalQuoted: 23100,
    quotesCount: 2,
    lastActivity: "2026-04-29",
  },
]

export const catalogItems: CatalogItem[] = [
  {
    id: "p1",
    name: "Licencia Cotix Pro",
    description: "Suscripcion anual con usuarios comerciales incluidos.",
    category: "Software",
    unitPrice: 8900,
    taxRate: 0.12,
    active: true,
  },
  {
    id: "p2",
    name: "Implementacion inicial",
    description: "Configuracion de marca, catalogo y plantillas comerciales.",
    category: "Servicios",
    unitPrice: 5590,
    taxRate: 0.12,
    active: true,
  },
  {
    id: "p3",
    name: "Capacitacion comercial",
    description: "Sesion de entrenamiento para vendedores y administradores.",
    category: "Servicios",
    unitPrice: 1800,
    taxRate: 0.12,
    active: true,
  },
]

export const dashboardMetrics: DashboardMetrics = {
  totalQuoted: 88920,
  totalAccepted: 42180,
  conversionRate: 61,
  quotesCreated: 38,
  quotesSent: 26,
  quotesAccepted: 16,
  quotesRejected: 4,
  avgQuoteValue: 12703,
  recentQuotes: quotes,
  expiringQuotes: [quotes[0], quotes[2]],
  topItems: [
    { itemName: "Licencia Cotix Pro", timesQuoted: 18, totalAmount: 160200 },
    { itemName: "Implementacion inicial", timesQuoted: 14, totalAmount: 78260 },
    { itemName: "Capacitacion comercial", timesQuoted: 10, totalAmount: 18000 },
  ],
  conversionSeries: dashboardSeries,
}

export const companySettings: CompanySettings = {
  businessName: "Distribuidora Garcia S.A.",
  tradeName: "Distribuidora Garcia",
  nit: "1234567-8",
  taxRegime: "General",
  email: "ventas@distribuidoragarcia.gt",
  phone: "+502 7765-4321",
  website: "distribuidoragarcia.gt",
  addressLine1: "7a Avenida 3-45, Zona 1",
  city: "Quetzaltenango",
  department: "Quetzaltenango",
  brandColor: "#1a6fdb",
  defaultCurrency: "GTQ",
  taxLabel: "IVA",
  taxRate: 12,
  quotePrefix: "COT",
  quoteDigits: 4,
  footerText: "Esta cotizacion es valida por el tiempo indicado.",
  defaultTerms: "Los precios estan sujetos a disponibilidad. Tiempo de entrega segun confirmacion de pago.",
}
