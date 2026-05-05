import { apiClient, credentialClient, refreshAccessToken, setAccessToken } from "@/api/client"
import type { AuthUser, UserRole } from "@/types/user"

export interface BackendUserDto {
  id: string | number
  name?: string
  full_name?: string
  first_name?: string
  last_name?: string
  email: string
  role?: UserRole
  tenant_id?: string | number
  tenant?: { id: string | number }
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
  nit: string
  email: string
  password: string
}

function mapUser(dto: BackendUserDto): AuthUser {
  const fullName = dto.name ?? dto.full_name ?? `${dto.first_name ?? ""} ${dto.last_name ?? ""}`.trim()
  return {
    id: String(dto.id),
    name: fullName || dto.email,
    email: dto.email,
    role: dto.role ?? "seller",
    tenantId: String(dto.tenant_id ?? dto.tenant?.id ?? ""),
  }
}

export async function login(payload: LoginRequestDto) {
  const response = await credentialClient.post<{ access: string }>("/auth/login/", payload)
  setAccessToken(response.data.access)
  const user = await getMe()
  return { access: response.data.access, user }
}

export async function register(payload: RegisterRequestDto) {
  await credentialClient.post<BackendUserDto>("/auth/register/", payload)
  return login({ email: payload.email, password: payload.password })
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

export async function requestPasswordReset(email: string) {
  const response = await credentialClient.post<{ ok: boolean }>("/auth/forgot-password/", { email })
  return response.data
}
