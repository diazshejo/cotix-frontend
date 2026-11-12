import { z } from "zod"

// Must match backend: apps/common/validators.py NIT_RE
const NIT_RE = /^(CF|[0-9]{5,12}-?[0-9Kk])$/i

const requiredText = (label: string, min = 2) => z.string().trim().min(min, `${label} es requerido.`)
const money = z.coerce.number({ invalid_type_error: "Ingresa un monto valido." }).min(0, "No puede ser negativo.")
const percent = z.coerce.number({ invalid_type_error: "Ingresa un porcentaje valido." }).min(0).max(100)

// min/max must stay in sync with backend serializers.py PASSWORD_MIN/MAX_LENGTH
const passwordField = (label = "El password") =>
  z
    .string()
    .min(8, `${label} debe tener al menos 8 caracteres.`)
    .max(128, `${label} no puede superar 128 caracteres.`)

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido."),
  password: z.string().min(1, "Ingresa tu password."),
})

export const registerSchema = z
  .object({
    // min(3) matches backend validate_business_name
    businessName: z.string().trim().min(3, "El nombre de empresa debe tener al menos 3 caracteres."),
    tradeName: z.string().trim().max(200).optional(),
    nit: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || NIT_RE.test(val), { message: "Formato NIT invalido. Ejemplo: 1234567-8 o CF." }),
    email: z.string().trim().email("Ingresa un email valido."),
    password: passwordField(),
    confirmPassword: z.string().min(8, "Confirma el password."),
    firstName: z.string().trim().max(100).optional(),
    lastName: z.string().trim().max(100).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Los passwords no coinciden.",
  })

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Ingresa un email valido."),
})

export const resetPasswordSchema = z
  .object({
    password: passwordField(),
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
  quantity: z.coerce.number().gt(0, "La cantidad debe ser mayor a cero."),
  unitPrice: money,
  discountRate: z.coerce.number().min(0).max(1),
  taxRate: z.coerce.number().min(0).max(1),
})

export const quoteSchema = z
  .object({
    clientId: requiredText("El cliente", 1),
    clientName: requiredText("El cliente"),
    title: requiredText("El titulo"),
    issueDate: z.string().min(1, "Selecciona fecha de emision."),
    validUntil: z.string().min(1, "Selecciona fecha de vencimiento."),
    items: z.array(quoteItemSchema).min(1, "Agrega al menos un producto o servicio."),
    notes: z.string().trim().optional(),
    termsConditions: z.string().trim().optional(),
  })
  .refine((data) => !data.issueDate || !data.validUntil || data.issueDate <= data.validUntil, {
    path: ["validUntil"],
    message: "La fecha de vencimiento debe ser igual o posterior a la fecha de emision.",
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
  pricesIncludeTax: z.boolean(),
  quotePrefix: requiredText("El prefijo", 2),
  quoteDigits: z.coerce.number().min(3).max(8),
  footerText: z.string().trim().max(2000, "El pie de pagina no puede superar 2000 caracteres."),
  defaultTerms: z.string().trim().max(10000, "Los terminos no pueden superar 10000 caracteres."),
})

export const createMemberSchema = z
  .object({
    firstName: requiredText("El nombre"),
    lastName: requiredText("El apellido"),
    email: z.string().trim().email("Ingresa un email valido."),
    role: z.enum(["tenant_admin", "seller", "viewer"]),
    password: passwordField("El password inicial"),
    confirmPassword: z.string().min(8, "Confirma el password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Los passwords no coinciden.",
  })

export const editMemberRoleSchema = z.object({
  role: z.enum(["tenant_admin", "seller", "viewer"]),
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>
export type ClientForm = z.infer<typeof clientSchema>
export type CatalogItemForm = z.infer<typeof catalogItemSchema>
export type QuoteForm = z.infer<typeof quoteSchema>
export type CompanySettingsForm = z.infer<typeof companySettingsSchema>
export type CreateMemberForm = z.infer<typeof createMemberSchema>
export type EditMemberRoleForm = z.infer<typeof editMemberRoleSchema>
