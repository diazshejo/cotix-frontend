import axios, { type InternalAxiosRequestConfig } from "axios"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 12000,
})

export const credentialClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 12000,
})

let csrfToken: string | null = null
let csrfRequest: Promise<string> | null = null
let refreshRequest: Promise<void> | null = null
let onUnauthorized: (() => void) | null = null

async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken
  csrfRequest ??= credentialClient.get<{ csrf_token: string }>("/auth/csrf/").then((response) => response.data.csrf_token)
  try {
    csrfToken = await csrfRequest
    return csrfToken
  } finally {
    csrfRequest = null
  }
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export async function refreshSessionCookie() {
  refreshRequest ??= credentialClient.post("/auth/refresh/").then(() => undefined).finally(() => { refreshRequest = null })
  return refreshRequest
}

async function attachCsrfToken(config: InternalAxiosRequestConfig) {
  if (config.method && !["get", "head", "options"].includes(config.method.toLowerCase())) {
    config.headers.set("X-CSRFToken", await ensureCsrfToken())
  }
  return config
}

apiClient.interceptors.request.use(attachCsrfToken)
credentialClient.interceptors.request.use(attachCsrfToken)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await refreshSessionCookie()
        return apiClient(originalRequest)
      } catch {
        onUnauthorized?.()
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.error
    if (typeof detail === "string") return detail
    if (error.code === "ECONNABORTED") return "El servidor tardo demasiado en responder."
    if (!error.response) return "No se pudo conectar con el backend."
  }

  return "Ocurrio un error inesperado."
}

export function isPlanRestriction(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 403) return false
  const data = error.response.data as { detail?: unknown; message?: unknown; error?: unknown }
  const text = [data?.detail, data?.message, data?.error]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
  return /plan|premium|business|actualiza|integraci|cotizaci|usuario/i.test(text)
}

export async function withMockFallback<T>(request: Promise<T>, fallback: T): Promise<T> {
  if (import.meta.env.VITE_USE_MOCKS !== "true") return request

  try {
    return await request
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      return fallback
    }

    throw error
  }
}
