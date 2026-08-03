import { apiClient } from "@/api/client"

export type IntegrationType = "rest_api" | "csv"
export type IntegrationStatus = "success" | "partial" | "failed" | "running" | ""
export type AuthType = "none" | "api_key" | "bearer" | "basic"
export type HttpMethod = "GET" | "POST"
export type SyncMode = "manual" | "scheduled"
export type PriceConflictPolicy = "overwrite" | "skip"

export interface IntegrationFilter {
  field: string
  operator: "eq" | "neq" | "contains" | "gt" | "gte" | "lt" | "lte"
  value: string
}

export interface CatalogIntegration {
  id: string
  name: string
  integration_type: IntegrationType
  endpoint_url: string
  http_method: HttpMethod
  auth_type: AuthType
  auth_header_name: string
  has_credentials: boolean
  request_body_template: string
  field_mapping: Record<string, string>
  response_array_path: string
  pre_import_filters: IntegrationFilter[]
  price_conflict_policy: PriceConflictPolicy
  sync_mode: SyncMode
  sync_frequency_hours: number | null
  next_sync_at: string | null
  last_synced_at: string | null
  last_sync_status: IntegrationStatus
  last_sync_created: number
  last_sync_updated: number
  last_sync_skipped: number
  last_sync_errors: number
  last_sync_error_detail: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface IntegrationCredentials {
  value?: string
  username?: string
  password?: string
}

export interface IntegrationPayload {
  name: string
  integration_type: IntegrationType
  endpoint_url?: string
  http_method?: HttpMethod
  auth_type?: AuthType
  auth_header_name?: string
  credentials?: IntegrationCredentials | string | null
  custom_headers?: Record<string, string> | null
  request_body_template?: string
  field_mapping?: Record<string, string>
  response_array_path?: string
  pre_import_filters?: IntegrationFilter[]
  price_conflict_policy?: PriceConflictPolicy
  sync_mode?: SyncMode
  sync_frequency_hours?: number | null
  is_active?: boolean
}

export interface IntegrationTestResult {
  status: "success" | "failed"
  products_found?: number
  sample_products?: Record<string, unknown>[]
  detected_fields?: string[]
  suggested_mapping?: Record<string, string>
  response_time_ms?: number
  error_code?: string
  error_message?: string
}

export interface IntegrationPreview {
  total_fetched: number
  total_after_filters: number
  sample_raw: Record<string, unknown>[]
  mapped_preview: Record<string, unknown>[]
  mapping_errors: string[]
  detected_fields: string[]
  suggested_mapping: Record<string, string>
}

export interface IntegrationSyncLog {
  id: string
  integration: string
  status: Exclude<IntegrationStatus, "">
  started_at: string
  finished_at: string | null
  duration_seconds: string | number | null
  total_fetched: number
  created_count: number
  updated_count: number
  skipped_count: number
  error_count: number
  error_details: unknown[]
  triggered_by: "manual" | "scheduled" | "api"
  triggered_by_user: string | number | null
  results: {
    total_fetched: number
    created: number
    updated: number
    skipped: number
    errors: number
  }
}

interface Paginated<T> {
  results: T[]
}

function unwrapList<T>(data: T[] | Paginated<T>) {
  return Array.isArray(data) ? data : data.results
}

function csvFormData(csvFile?: File) {
  const formData = new FormData()
  if (csvFile) formData.append("csv_file", csvFile)
  return formData
}

export { isPlanRestriction } from "@/api/client"

export async function listCatalogIntegrations() {
  const response = await apiClient.get<CatalogIntegration[] | Paginated<CatalogIntegration>>("/integrations/catalog/")
  return unwrapList(response.data)
}

export async function createCatalogIntegration(payload: IntegrationPayload) {
  const response = await apiClient.post<CatalogIntegration>("/integrations/catalog/", payload)
  return response.data
}

export async function updateCatalogIntegration(id: string, payload: Partial<IntegrationPayload>) {
  const response = await apiClient.patch<CatalogIntegration>(`/integrations/catalog/${id}/`, payload)
  return response.data
}

export async function deleteCatalogIntegration(id: string) {
  await apiClient.delete(`/integrations/catalog/${id}/`)
}

export async function testCatalogIntegration(id: string, integrationType: IntegrationType, csvFile?: File) {
  const body = integrationType === "csv" ? csvFormData(csvFile) : undefined
  const response = await apiClient.post<IntegrationTestResult>(`/integrations/catalog/${id}/test/`, body)
  return response.data
}

export async function previewCatalogIntegration(id: string, integrationType: IntegrationType, csvFile?: File) {
  const response =
    integrationType === "csv"
      ? await apiClient.post<IntegrationPreview>(`/integrations/catalog/${id}/preview/`, csvFormData(csvFile))
      : await apiClient.get<IntegrationPreview>(`/integrations/catalog/${id}/preview/`)
  return response.data
}

export async function syncCatalogIntegration(id: string, integrationType: IntegrationType, csvFile?: File) {
  const body = integrationType === "csv" ? csvFormData(csvFile) : undefined
  const response = await apiClient.post<IntegrationSyncLog>(`/integrations/catalog/${id}/sync/`, body)
  return response.data
}

export async function listIntegrationLogs(id: string) {
  const response = await apiClient.get<IntegrationSyncLog[] | Paginated<IntegrationSyncLog>>(`/integrations/catalog/${id}/logs/`)
  return unwrapList(response.data)
}
