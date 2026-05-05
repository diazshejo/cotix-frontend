import { z } from "zod"

const requiredText = (label: string, min = 2) => z.string().trim().min(min, `${label} es requerido.`)
const money = z.coerce.number({ invalid_type_error: "Ingresa un monto valido." }).min(0, "No puede ser negativo.")
const percent = z.coerce.number({ invalid_type_error: "Ingresa un porcentaje valido." }).min(0).max(100)

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido."),
  password: z.string().min(8, "El password debe tener al menos 8 caracteres."),
})

export const registerSchema = z
  .object({
    businessName: requiredText("El nombre de empresa"),
    nit: z.string().trim().optional(),
    email: z.string().trim().email("Ingresa un email valido."),
    password: z.string().min(8, "Minimo 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirma el password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Los passwords no coinciden.",
  })

export const clientSchema = z.object({
  name: requiredText("El nombre del cliente"),
  email: z.string().trim().email("Ingresa un email valido."),
  phone: z.string().trim().optional(),
  nit: z.string().trim().optional(),
  companyType: z.enum(["company", "person"]),
})

export const catalogItemSchema = z.object({
  name: requiredText("El nombre del item"),
  description: requiredText("La descripcion", 4),
  category: requiredText("La categoria"),
  unitPrice: money,
  taxRate: percent,
  active: z.boolean(),
})

export const quoteItemSchema = z.object({
  id: z.string(),
  name: requiredText("El item"),
  description: z.string(),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
  unitPrice: money,
  discountRate: z.coerce.number().min(0).max(1),
  taxRate: z.coerce.number().min(0).max(1),
})

export const quoteSchema = z.object({
  clientId: requiredText("El cliente", 1),
  clientName: requiredText("El cliente"),
  title: requiredText("El titulo"),
  issueDate: z.string().min(1, "Selecciona fecha de emision."),
  validUntil: z.string().min(1, "Selecciona fecha de vencimiento."),
  items: z.array(quoteItemSchema).min(1, "Agrega al menos un producto o servicio."),
  notes: z.string().trim().optional(),
})

export const companySettingsSchema = z.object({
  businessName: requiredText("El nombre legal"),
  tradeName: requiredText("El nombre comercial"),
  nit: requiredText("El NIT", 3),
  taxRegime: requiredText("El regimen fiscal"),
  email: z.string().trim().email("Email invalido."),
  phone: requiredText("El telefono", 6),
  website: z.string().trim().optional(),
  addressLine1: requiredText("La direccion"),
  city: requiredText("La ciudad"),
  department: requiredText("El departamento"),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal invalido."),
  defaultCurrency: z.enum(["GTQ", "USD"]),
  taxLabel: requiredText("La etiqueta de impuesto", 2),
  taxRate: percent,
  quotePrefix: requiredText("El prefijo", 2),
  quoteDigits: z.coerce.number().min(3).max(8),
  footerText: requiredText("El pie de pagina", 8),
  defaultTerms: requiredText("Los terminos", 8),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ClientForm = z.infer<typeof clientSchema>
export type CatalogItemForm = z.infer<typeof catalogItemSchema>
export type QuoteForm = z.infer<typeof quoteSchema>
export type CompanySettingsForm = z.infer<typeof companySettingsSchema>
