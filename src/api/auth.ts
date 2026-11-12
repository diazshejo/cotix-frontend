import { apiClient, credentialClient, refreshAccessToken, setAccessToken } from "@/api/client"
import type { AuthUser, TenantPlan, TenantStatus, UserRole } from "@/types/user"

export interface BackendUserDto {
  id: string | number
  name?: string
  full_name?: string
  first_name?: string
  last_name?: string
  email: string
  role?: UserRole
  email_verified?: boolean
  tenant_id?: string | number
  tenant?: {
    id: string | number
    plan?: string
    status?: string
    trial_ends_at?: string
    trial_expired?: boolean
  }
}

export interface AuthResponseDto {
  access: string
  user: BackendUserDto
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  business_name: string
  trade_name?: string
  nit?: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface RegisterResult {
  pendingVerification: true
  email: string
}

function mapUser(dto: BackendUserDto): AuthUser {
  const fullName = dto.name ?? dto.full_name ?? `${dto.first_name ?? ""} ${dto.last_name ?? ""}`.trim()
  return {
    id: String(dto.id),
    name: fullName || dto.email,
    email: dto.email,
    role: dto.role ?? "seller",
    tenantId: String(dto.tenant_id ?? dto.tenant?.id ?? ""),
    tenantPlan: (dto.tenant?.plan ?? "free") as TenantPlan,
    tenantStatus: (dto.tenant?.status ?? "demo") as TenantStatus,
    trialEndsAt: dto.tenant?.trial_ends_at,
    trialExpired: dto.tenant?.trial_expired ?? false,
  }
}

export async function login(payload: LoginRequestDto) {
  const response = await credentialClient.post<{ access: string }>("/auth/login/", payload)
  setAccessToken(response.data.access)
  const user = await getMe()
  return { access: response.data.access, user }
}

export async function register(payload: RegisterRequestDto): Promise<RegisterResult> {
  await credentialClient.post<BackendUserDto>("/auth/register/", payload)
  return { pendingVerification: true, email: payload.email }
}

export async function verifyEmail(token: string): Promise<void> {
  await credentialClient.post("/auth/verify-email/", { token })
}

export async function resendVerification(email: string): Promise<void> {
  await credentialClient.post("/auth/resend-verification/", { email })
}

export async function requestPasswordReset(email: string): Promise<void> {
  await credentialClient.post("/auth/forgot-password/", { email })
}

export async function resetPassword(token: string, password: string, confirmPassword: string): Promise<void> {
  await credentialClient.post("/auth/reset-password-confirm/", {
    token,
    password,
    confirm_password: confirmPassword,
  })
}

export async function refreshSession() {
  return refreshAccessToken()
}

export async function getMe() {
  const response = await apiClient.get<BackendUserDto>("/auth/me/")
  return mapUser(response.data)
}

export async function logout() {
  await credentialClient.post("/auth/logout/").catch(() => undefined)
  setAccessToken(null)
}
