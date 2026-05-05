import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

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

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export async function refreshAccessToken() {
  const response = await credentialClient.post<{ access: string }>("/auth/refresh/")
  setAccessToken(response.data.access)
  return response.data.access
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const access = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${access}`
        return apiClient(originalRequest)
      } catch {
        setAccessToken(null)
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

export async function withMockFallback<T>(request: Promise<T>, fallback: T): Promise<T> {
  if (import.meta.env.VITE_USE_MOCKS === "false") return request

  try {
    return await request
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response) {
      return fallback
    }

    throw error
  }
}
