import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import {
  Activity,
  CheckCircle2,
  Clock,
  Eye,
  FileClock,
  Pencil,
  PauseCircle,
  PlayCircle,
  PlugZap,
  RefreshCw,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { FormEvent, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  CatalogIntegration,
  IntegrationFilter,
  IntegrationPreview,
  IntegrationSyncLog,
  IntegrationType,
  createCatalogIntegration,
  deleteCatalogIntegration,
  isPlanRestriction,
  listCatalogIntegrations,
  listIntegrationLogs,
  previewCatalogIntegration,
  syncCatalogIntegration,
  testCatalogIntegration,
  updateCatalogIntegration,
} from "@/api/integrations"
import { getApiErrorMessage } from "@/api/client"
import { MobileFab } from "@/components/common/MobileFab"
import { PageSkeleton } from "@/components/common/Skeleton"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { FieldError, InputField, SelectField, TextareaField } from "@/components/ui/Form"
import { queryKeys } from "@/constants/queryKeys"
import { routes } from "@/constants/routes"
import { cn } from "@/utils/cn"

const cotixFields = ["sku", "name", "unit_price", "unit", "category", "description"] as const
const operators: IntegrationFilter["operator"][] = ["eq", "neq", "contains", "gt", "gte", "lt", "lte"]

type WizardStep = "type" | "connection" | "test" | "preview" | "mapping" | "filters" | "sync" | "summary"

interface WizardState {
  id?: string
  name: string
  integration_type: IntegrationType
  endpoint_url: string
  http_method: "GET" | "POST"
  auth_type: "none" | "api_key" | "bearer" | "basic"
  auth_header_name: string
  credential_value: string
  basic_username: string
  basic_password: string
  custom_headers_text: string
  request_body_template: string
  response_array_path: string
  field_mapping: Record<string, string>
  pre_import_filters: IntegrationFilter[]
  sync_mode: "manual" | "scheduled"
  sync_frequency_hours: string
  price_conflict_policy: "overwrite" | "skip"
  is_active: boolean
}

const emptyWizard: WizardState = {
  name: "",
  integration_type: "rest_api",
  endpoint_url: "",
  http_method: "GET",
  auth_type: "none",
  auth_header_name: "",
  credential_value: "",
  basic_username: "",
  basic_password: "",
  custom_headers_text: "",
  request_body_template: "",
  response_array_path: "",
  field_mapping: {},
  pre_import_filters: [],
  sync_mode: "manual",
  sync_frequency_hours: "",
  price_conflict_policy: "overwrite",
  is_active: true,
}

function formatDate(value?: string | null) {
  if (!value) return "Nunca"
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    success: "Exitoso",
    partial: "Parcial",
    failed: "Fallido",
    running: "En proceso",
    "": "Sin sync",
  }
  return labels[status] ?? status
}

function IntegrationStatusBadge({ status, active }: { status: string; active?: boolean }) {
  const tone = {
    success: "bg-emerald-100 text-emerald-700",
    partial: "bg-amber-100 text-amber-800",
    failed: "bg-rose-100 text-rose-700",
    running: "bg-blue-100 text-blue-700",
    idle: "bg-slate-100 text-slate-700",
  }
  const key = status || "idle"
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tone[key as keyof typeof tone] ?? tone.idle)}>
      {active === false ? "Pausada" : statusLabel(status)}
    </span>
  )
}

function toWizard(integration: CatalogIntegration): WizardState {
  return {
    ...emptyWizard,
    id: integration.id,
    name: integration.name,
    integration_type: integration.integration_type,
    endpoint_url: integration.endpoint_url,
    http_method: integration.http_method,
    auth_type: integration.auth_type,
    auth_header_name: integration.auth_header_name,
    request_body_template: integration.request_body_template,
    response_array_path: integration.response_array_path,
    field_mapping: integration.field_mapping ?? {},
    pre_import_filters: integration.pre_import_filters ?? [],
    sync_mode: integration.sync_mode,
    sync_frequency_hours: integration.sync_frequency_hours ? String(integration.sync_frequency_hours) : "",
    price_conflict_policy: integration.price_conflict_policy,
    is_active: integration.is_active,
  }
}

function parseJsonObject(value: string, label: string) {
  if (!value.trim()) return undefined
  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error()
    return parsed as Record<string, string>
  } catch {
    throw new Error(`${label} debe ser JSON valido.`)
  }
}

function payloadFromState(state: WizardState, includeSecrets: boolean) {
  const customHeaders = parseJsonObject(state.custom_headers_text, "Headers personalizados")
  const payload = {
    name: state.name.trim(),
    integration_type: state.integration_type,
    endpoint_url: state.integration_type === "rest_api" ? state.endpoint_url.trim() : "",
    http_method: state.http_method,
    auth_type: state.auth_type,
    auth_header_name: state.auth_header_name.trim(),
    custom_headers: customHeaders,
    request_body_template: state.http_method === "POST" ? state.request_body_template : "",
    field_mapping: state.field_mapping,
    response_array_path: state.response_array_path.trim(),
    pre_import_filters: state.pre_import_filters.filter((filter) => filter.field.trim() && filter.value.trim()),
    price_conflict_policy: state.price_conflict_policy,
    sync_mode: state.sync_mode,
    sync_frequency_hours: state.sync_mode === "scheduled" ? Number(state.sync_frequency_hours) : null,
    is_active: state.is_active,
  }

  if (!includeSecrets) return payload
  if (state.auth_type === "basic" && (state.basic_username || state.basic_password)) {
    return { ...payload, credentials: { username: state.basic_username, password: state.basic_password } }
  }
  if (state.auth_type !== "none" && state.credential_value) {
    return { ...payload, credentials: { value: state.credential_value } }
  }
  return payload
}

function validateState(state: WizardState) {
  if (!state.name.trim()) return "El nombre es obligatorio."
  if (state.integration_type === "rest_api" && !state.endpoint_url.trim()) return "La URL del endpoint es obligatoria."
  if (state.sync_mode === "scheduled" && (!Number(state.sync_frequency_hours) || Number(state.sync_frequency_hours) <= 0)) {
    return "La frecuencia programada debe ser mayor a cero."
  }
  try {
    parseJsonObject(state.custom_headers_text, "Headers personalizados")
  } catch (error) {
    return error instanceof Error ? error.message : "Headers personalizados debe ser JSON valido."
  }
  return null
}

function PlanUpsell({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  return (
    <Card>
      <CardContent className={cn("flex flex-col gap-4", compact ? "p-4" : "p-6 md:flex-row md:items-center md:justify-between")}>
        <div>
          <p className="label">Plan requerido</p>
          <h3 className="mt-1 text-lg font-bold">Integraciones API estan disponibles en Premium/Business</h3>
          <p className="mt-1 text-sm text-muted-foreground">Puedes revisar la funcionalidad, pero el backend requiere un plan superior para activarla o sincronizar.</p>
        </div>
        <Button type="button" className="w-full md:w-auto" onClick={() => navigate(routes.settingsBilling)}>
          Actualizar plan
        </Button>
      </CardContent>
    </Card>
  )
}

function DataPreviewTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = useMemo(() => Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).slice(0, 6), [rows])
  if (!rows.length) return <p className="text-sm text-muted-foreground">Sin registros para mostrar.</p>
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full divide-y divide-border text-left text-sm">
        <thead className="bg-muted/70">
          <tr>{columns.map((column) => <th key={column} className="px-3 py-2 font-semibold">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {rows.slice(0, 5).map((row, index) => (
            <tr key={index}>
              {columns.map((column) => <td key={column} className="max-w-64 truncate px-3 py-2">{String(row[column] ?? "")}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function IntegrationWizard({
  initial,
  onClose,
  onPlanBlocked,
}: {
  initial?: CatalogIntegration
  onClose: () => void
  onPlanBlocked: () => void
}) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<WizardStep>("type")
  const [state, setState] = useState<WizardState>(() => (initial ? toWizard(initial) : emptyWizard))
  const [csvFile, setCsvFile] = useState<File | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<Awaited<ReturnType<typeof testCatalogIntegration>> | null>(null)
  const [preview, setPreview] = useState<IntegrationPreview | null>(null)

  const detectedFields = preview?.detected_fields ?? testResult?.detected_fields ?? []
  const suggestedMapping = preview?.suggested_mapping ?? testResult?.suggested_mapping ?? {}
  const stepList: WizardStep[] = ["type", "connection", "test", "preview", "mapping", "filters", "sync", "summary"]
  const currentIndex = stepList.indexOf(step)

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setState((current) => ({ ...current, [key]: value }))
  }

  function applySuggestions() {
    setState((current) => ({ ...current, field_mapping: { ...current.field_mapping, ...suggestedMapping } }))
  }

  async function ensureDraft() {
    const validation = validateState({ ...state, is_active: false })
    if (validation) throw new Error(validation)
    const includeSecrets = !state.id || Boolean(state.credential_value || state.basic_username || state.basic_password)
    const payload = { ...payloadFromState({ ...state, is_active: false }, includeSecrets), is_active: false }
    const saved = state.id ? await updateCatalogIntegration(state.id, payload) : await createCatalogIntegration(payload)
    setState((current) => ({ ...current, id: saved.id }))
    await queryClient.invalidateQueries({ queryKey: queryKeys.integrations })
    return saved.id
  }

  async function runTest() {
    setError(null)
    try {
      const id = await ensureDraft()
      const result = await testCatalogIntegration(id, state.integration_type, csvFile)
      setTestResult(result)
      toast.success("Conexion probada.")
    } catch (requestError) {
      if (isPlanRestriction(requestError)) onPlanBlocked()
      setError(getApiErrorMessage(requestError))
    }
  }

  async function runPreview() {
    setError(null)
    try {
      const id = await ensureDraft()
      const result = await previewCatalogIntegration(id, state.integration_type, csvFile)
      setPreview(result)
      if (Object.keys(result.suggested_mapping).length) {
        setState((current) => ({ ...current, field_mapping: { ...result.suggested_mapping, ...current.field_mapping } }))
      }
      toast.success("Preview generado.")
    } catch (requestError) {
      if (isPlanRestriction(requestError)) onPlanBlocked()
      setError(getApiErrorMessage(requestError))
    }
  }

  async function saveIntegration(event: FormEvent) {
    event.preventDefault()
    setError(null)
    try {
      const validation = validateState(state)
      if (validation) throw new Error(validation)
      const payload = payloadFromState(state, !state.id || Boolean(state.credential_value || state.basic_username || state.basic_password))
      const saved = state.id ? await updateCatalogIntegration(state.id, payload) : await createCatalogIntegration(payload)
      await queryClient.invalidateQueries({ queryKey: queryKeys.integrations })
      toast.success(`Integracion ${saved.name} guardada.`)
      onClose()
    } catch (requestError) {
      if (isPlanRestriction(requestError)) onPlanBlocked()
      setError(requestError instanceof Error && !axios.isAxiosError(requestError) ? requestError.message : getApiErrorMessage(requestError))
    }
  }

  function nextStep() {
    setError(null)
    const validation = step === "type" || step === "connection" || step === "sync" ? validateState(state) : null
    if (validation) {
      setError(validation)
      return
    }
    setStep(stepList[Math.min(currentIndex + 1, stepList.length - 1)])
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-3 md:p-6">
      <form className="mx-auto max-w-5xl rounded-lg bg-white shadow-soft" onSubmit={saveIntegration}>
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="label">Integraciones</p>
            <h2 className="mt-1 text-xl font-bold">{initial ? "Editar integracion" : "Nueva integracion"}</h2>
          </div>
          <button type="button" aria-label="Cerrar" className="focus-ring rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-2">
            {stepList.map((item, index) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold",
                  step === item ? "bg-primary text-primary-foreground" : index < currentIndex ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground",
                )}
                onClick={() => setStep(item)}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-xs">{index + 1}</span>
                {item === "type" ? "Tipo" : item === "connection" ? "Conexion" : item === "test" ? "Prueba" : item === "preview" ? "Preview" : item === "mapping" ? "Mapping" : item === "filters" ? "Filtros" : item === "sync" ? "Sync" : "Resumen"}
              </button>
            ))}
          </aside>

          <section className="min-h-[460px] space-y-5">
            {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}

            {step === "type" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {(["rest_api", "csv"] as IntegrationType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={cn("rounded-lg border p-5 text-left transition hover:border-primary", state.integration_type === type ? "border-primary bg-primary/5" : "border-border bg-white")}
                    onClick={() => update("integration_type", type)}
                  >
                    <PlugZap className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 text-lg font-bold">{type === "rest_api" ? "REST API" : "CSV"}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{type === "rest_api" ? "Consume productos desde un endpoint externo." : "Importa productos desde un archivo CSV."}</p>
                  </button>
                ))}
              </div>
            ) : null}

            {step === "connection" ? (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <InputField label="Nombre" value={state.name} onChange={(event) => update("name", event.target.value)} />
                  <SelectField label="Metodo HTTP" value={state.http_method} disabled={state.integration_type === "csv"} onChange={(event) => update("http_method", event.target.value as WizardState["http_method"])}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </SelectField>
                  {state.integration_type === "rest_api" ? <InputField label="Endpoint URL" value={state.endpoint_url} onChange={(event) => update("endpoint_url", event.target.value)} className="md:col-span-2" /> : null}
                  <SelectField label="Autenticacion" value={state.auth_type} onChange={(event) => update("auth_type", event.target.value as WizardState["auth_type"])}>
                    <option value="none">Ninguna</option>
                    <option value="api_key">API key</option>
                    <option value="bearer">Bearer</option>
                    <option value="basic">Basic</option>
                  </SelectField>
                  <InputField label="Header auth" value={state.auth_header_name} disabled={state.auth_type === "none"} onChange={(event) => update("auth_header_name", event.target.value)} placeholder="Authorization o X-API-Key" />
                  {state.auth_type === "basic" ? (
                    <>
                      <InputField label="Usuario" value={state.basic_username} onChange={(event) => update("basic_username", event.target.value)} />
                      <InputField label="Password" type="password" value={state.basic_password} onChange={(event) => update("basic_password", event.target.value)} />
                    </>
                  ) : state.auth_type !== "none" ? (
                    <InputField label="Credencial" type="password" value={state.credential_value} onChange={(event) => update("credential_value", event.target.value)} />
                  ) : null}
                  <TextareaField label="Headers personalizados JSON" value={state.custom_headers_text} onChange={(event) => update("custom_headers_text", event.target.value)} placeholder='{"X-Tenant":"cotix"}' />
                  <InputField label="Array path" value={state.response_array_path} onChange={(event) => update("response_array_path", event.target.value)} placeholder="data.items" />
                </div>
                {state.http_method === "POST" && state.integration_type === "rest_api" ? (
                  <TextareaField label="Body template" value={state.request_body_template} onChange={(event) => update("request_body_template", event.target.value)} placeholder='{"limit": 100}' />
                ) : null}
                {state.integration_type === "csv" ? (
                  <label className="block">
                    <span className="label">Archivo CSV</span>
                    <input className="field mt-2 py-2" type="file" accept=".csv,text/csv" onChange={(event) => setCsvFile(event.target.files?.[0])} />
                  </label>
                ) : null}
              </div>
            ) : null}

            {step === "test" ? (
              <div className="space-y-4">
                <Button type="button" onClick={() => void runTest()}><Activity className="h-4 w-4" />Probar conexion</Button>
                {testResult ? (
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <IntegrationStatusBadge status={testResult.status === "success" ? "success" : "failed"} />
                      <span className="text-sm text-muted-foreground">{testResult.products_found ?? 0} productos detectados</span>
                      {testResult.response_time_ms ? <span className="text-sm text-muted-foreground">{testResult.response_time_ms} ms</span> : null}
                    </div>
                    <div className="mt-4">
                      <DataPreviewTable rows={testResult.sample_products ?? []} />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === "preview" ? (
              <div className="space-y-4">
                <Button type="button" onClick={() => void runPreview()}><Eye className="h-4 w-4" />Generar preview</Button>
                {preview ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-md bg-muted p-3 text-sm"><strong>{preview.total_fetched}</strong> encontrados</div>
                      <div className="rounded-md bg-muted p-3 text-sm"><strong>{preview.total_after_filters}</strong> despues de filtros</div>
                    </div>
                    <DataPreviewTable rows={preview.mapped_preview} />
                    {preview.mapping_errors.length ? <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{preview.mapping_errors.join(" ")}</div> : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === "mapping" ? (
              <div className="space-y-4">
                {Object.keys(suggestedMapping).length ? <Button type="button" variant="secondary" onClick={applySuggestions}><CheckCircle2 className="h-4 w-4" />Aplicar sugerencias</Button> : null}
                <div className="grid gap-4 md:grid-cols-2">
                  {cotixFields.map((field) => (
                    <SelectField
                      key={field}
                      label={field}
                      value={state.field_mapping[field] ?? ""}
                      onChange={(event) => update("field_mapping", { ...state.field_mapping, [field]: event.target.value })}
                    >
                      <option value="">Sin mapear</option>
                      {detectedFields.map((detected) => <option key={detected} value={detected}>{detected}</option>)}
                    </SelectField>
                  ))}
                </div>
                {!detectedFields.length ? <p className="text-sm text-muted-foreground">Ejecuta prueba o preview para cargar campos detectados.</p> : null}
              </div>
            ) : null}

            {step === "filters" ? (
              <div className="space-y-4">
                {state.pre_import_filters.map((filter, index) => (
                  <div key={index} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_140px_1fr_auto]">
                    <InputField label="Campo" value={filter.field} onChange={(event) => {
                      const next = [...state.pre_import_filters]
                      next[index] = { ...filter, field: event.target.value }
                      update("pre_import_filters", next)
                    }} />
                    <SelectField label="Operador" value={filter.operator} onChange={(event) => {
                      const next = [...state.pre_import_filters]
                      next[index] = { ...filter, operator: event.target.value as IntegrationFilter["operator"] }
                      update("pre_import_filters", next)
                    }}>{operators.map((operator) => <option key={operator} value={operator}>{operator}</option>)}</SelectField>
                    <InputField label="Valor" value={filter.value} onChange={(event) => {
                      const next = [...state.pre_import_filters]
                      next[index] = { ...filter, value: event.target.value }
                      update("pre_import_filters", next)
                    }} />
                    <Button type="button" variant="ghost" className="self-end" onClick={() => update("pre_import_filters", state.pre_import_filters.filter((_, itemIndex) => itemIndex !== index))}>Quitar</Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={() => update("pre_import_filters", [...state.pre_import_filters, { field: "", operator: "eq", value: "" }])}>Agregar filtro</Button>
              </div>
            ) : null}

            {step === "sync" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField label="Modo sync" value={state.sync_mode} onChange={(event) => update("sync_mode", event.target.value as WizardState["sync_mode"])}>
                  <option value="manual">Manual</option>
                  <option value="scheduled">Programado</option>
                </SelectField>
                <InputField label="Frecuencia horas" type="number" min={1} disabled={state.sync_mode === "manual"} value={state.sync_frequency_hours} onChange={(event) => update("sync_frequency_hours", event.target.value)} />
                <SelectField label="Conflicto de precio" value={state.price_conflict_policy} onChange={(event) => update("price_conflict_policy", event.target.value as WizardState["price_conflict_policy"])}>
                  <option value="overwrite">Sobrescribir</option>
                  <option value="skip">Omitir</option>
                </SelectField>
                <label className="flex items-center gap-3 rounded-md border border-border px-3 py-3">
                  <input type="checkbox" checked={state.is_active} onChange={(event) => update("is_active", event.target.checked)} />
                  <span className="text-sm font-semibold">Activa</span>
                </label>
              </div>
            ) : null}

            {step === "summary" ? (
              <div className="space-y-4 rounded-lg border border-border p-4 text-sm">
                <p><strong>Nombre:</strong> {state.name || "Sin nombre"}</p>
                <p><strong>Tipo:</strong> {state.integration_type === "rest_api" ? "REST API" : "CSV"}</p>
                <p><strong>Sync:</strong> {state.sync_mode === "scheduled" ? `Cada ${state.sync_frequency_hours} horas` : "Manual"}</p>
                <p><strong>Mapping:</strong> {Object.values(state.field_mapping).filter(Boolean).length} campos configurados</p>
                <p><strong>Filtros:</strong> {state.pre_import_filters.filter((filter) => filter.field && filter.value).length}</p>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(stepList[Math.max(currentIndex - 1, 0)])} disabled={currentIndex === 0}>Anterior</Button>
              <div className="flex flex-col gap-3 sm:flex-row">
                {currentIndex < stepList.length - 1 ? <Button type="button" onClick={nextStep}>Siguiente</Button> : null}
                <Button type="submit"><Save className="h-4 w-4" />Guardar</Button>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}

function HistoryPanel({ integration, onClose }: { integration: CatalogIntegration; onClose: () => void }) {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: queryKeys.integrationLogs(integration.id),
    queryFn: () => listIntegrationLogs(integration.id),
    retry: false,
  })

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/55 p-3 md:p-6">
      <div className="mx-auto max-w-5xl rounded-lg bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <p className="label">Historial</p>
            <h2 className="mt-1 text-xl font-bold">{integration.name}</h2>
          </div>
          <button type="button" aria-label="Cerrar" className="focus-ring rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">
          {isLoading ? <LoadingState title="Cargando historial" /> : null}
          {isError ? (
            isPlanRestriction(error) ? (
              <PlanUpsell compact />
            ) : (
              <ErrorState title="No se pudo cargar historial" description="La API no respondio correctamente." />
            )
          ) : null}
          {data ? <LogsTable logs={data} /> : null}
        </div>
      </div>
    </div>
  )
}

function LogsTable({ logs }: { logs: IntegrationSyncLog[] }) {
  if (!logs.length) return <p className="text-sm text-muted-foreground">Aun no hay sincronizaciones.</p>
  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="min-w-full divide-y divide-border text-left text-sm">
        <thead className="bg-muted/70">
          <tr>
            <th className="px-3 py-2 font-semibold">Estado</th>
            <th className="px-3 py-2 font-semibold">Inicio</th>
            <th className="px-3 py-2 font-semibold">Duracion</th>
            <th className="px-3 py-2 font-semibold">Resultados</th>
            <th className="px-3 py-2 font-semibold">Errores</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {logs.map((log) => (
            <tr key={log.id} className="align-top">
              <td className="px-3 py-3"><IntegrationStatusBadge status={log.status} /></td>
              <td className="px-3 py-3">{formatDate(log.started_at)}</td>
              <td className="px-3 py-3">{log.duration_seconds ?? "-"}s</td>
              <td className="px-3 py-3">
                <span className="whitespace-nowrap">C {log.results.created}</span>{" "}
                <span className="whitespace-nowrap">A {log.results.updated}</span>{" "}
                <span className="whitespace-nowrap">O {log.results.skipped}</span>
              </td>
              <td className="max-w-md px-3 py-3">
                <span className="font-semibold">{log.results.errors}</span>
                {log.error_details.length ? <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(log.error_details, null, 2)}</pre> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function IntegrationsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [wizardIntegration, setWizardIntegration] = useState<CatalogIntegration | null | undefined>(undefined)
  const [historyIntegration, setHistoryIntegration] = useState<CatalogIntegration | null>(null)
  const [previewIntegration, setPreviewIntegration] = useState<CatalogIntegration | null>(null)
  const [preview, setPreview] = useState<IntegrationPreview | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [csvFiles, setCsvFiles] = useState<Record<string, File | undefined>>({})

  const integrationsQuery = useQuery({
    queryKey: queryKeys.integrations,
    queryFn: listCatalogIntegrations,
    retry: false,
  })

  const refreshIntegrations = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.integrations })
  }

  const actionMutation = useMutation({
    mutationFn: async ({ type, integration }: { type: "test" | "sync" | "toggle" | "delete" | "preview"; integration: CatalogIntegration }) => {
      if (type === "test") return testCatalogIntegration(integration.id, integration.integration_type, csvFiles[integration.id])
      if (type === "sync") return syncCatalogIntegration(integration.id, integration.integration_type, csvFiles[integration.id])
      if (type === "toggle") return updateCatalogIntegration(integration.id, { is_active: !integration.is_active })
      if (type === "delete") return deleteCatalogIntegration(integration.id)
      return previewCatalogIntegration(integration.id, integration.integration_type, csvFiles[integration.id])
    },
    onSuccess: async (result, variables) => {
      if (variables.type === "preview") {
        setPreview(result as IntegrationPreview)
        setPreviewIntegration(variables.integration)
      } else {
        toast.success(variables.type === "sync" ? "Sincronizacion iniciada." : variables.type === "delete" ? "Integracion eliminada." : "Accion completada.")
      }
      await refreshIntegrations()
    },
    onError: (error) => {
      if (isPlanRestriction(error)) setPlanBlocked(true)
      toast.error(getApiErrorMessage(error))
    },
  })

  if (integrationsQuery.isLoading) return <PageSkeleton variant="integrations" />
  if (integrationsQuery.isError) {
    if (isPlanRestriction(integrationsQuery.error)) return <PlanUpsell />
    return <ErrorState title="No se pudo cargar integraciones" description="La API no respondio correctamente." onAction={() => void integrationsQuery.refetch()} />
  }

  const integrations = integrationsQuery.data ?? []

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label">Configuracion</p>
          <h2 className="mt-2 text-2xl font-bold">Integraciones</h2>
          <p className="mt-2 text-sm text-muted-foreground">Catalogo externo V1 para REST API y CSV.</p>
        </div>
        <Button className="hidden sm:inline-flex" onClick={() => setWizardIntegration(null)}><PlugZap className="h-4 w-4" />Nueva integracion</Button>
      </div>

      {planBlocked ? <PlanUpsell compact /> : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label">Catalogo externo</p>
              <h3 className="mt-1 text-lg font-bold">Conexiones configuradas</h3>
            </div>
            <Button variant="secondary" onClick={() => void integrationsQuery.refetch()}><RefreshCw className="h-4 w-4" />Actualizar</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!integrations.length ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <PlugZap className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 text-lg font-bold">Sin integraciones</h3>
              <p className="mt-1 text-sm text-muted-foreground">Crea una integracion REST API o CSV para importar catalogo.</p>
              <Button className="mt-5" onClick={() => setWizardIntegration(null)}><PlugZap className="h-4 w-4" />Nueva integracion</Button>
            </div>
          ) : (
            <>
            <div className="grid gap-3 lg:hidden">
              {integrations.map((integration) => (
                <article key={integration.id} className="rounded-lg border border-border bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{integration.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {integration.integration_type === "rest_api" ? "REST API" : "CSV"} - {integration.sync_mode === "scheduled" ? `cada ${integration.sync_frequency_hours}h` : "manual"}
                      </p>
                    </div>
                    <IntegrationStatusBadge status={integration.last_sync_status} active={integration.is_active} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                    <div>
                      <span className="label">Ultima sync</span>
                      <p className="mt-1 text-muted-foreground">{formatDate(integration.last_synced_at)}</p>
                    </div>
                    <div>
                      <span className="label">Proxima</span>
                      <p className="mt-1 text-muted-foreground">{integration.sync_mode === "scheduled" ? formatDate(integration.next_sync_at) : "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">C {integration.last_sync_created}</span>
                    <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">A {integration.last_sync_updated}</span>
                    <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">O {integration.last_sync_skipped}</span>
                    <span className="rounded bg-rose-50 px-2 py-1 text-rose-700">E {integration.last_sync_errors}</span>
                  </div>

                  {integration.integration_type === "csv" ? (
                    <label className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      Seleccionar CSV
                      <input className="sr-only" type="file" accept=".csv,text/csv" onChange={(event) => setCsvFiles((current) => ({ ...current, [integration.id]: event.target.files?.[0] }))} />
                    </label>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="secondary" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "test", integration })}><Activity className="h-4 w-4" />Probar</Button>
                    <Button variant="secondary" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "preview", integration })}><Eye className="h-4 w-4" />Preview</Button>
                    <Button variant="secondary" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "sync", integration })}><RefreshCw className="h-4 w-4" />Sync</Button>
                    <Button variant="secondary" className="h-9 px-3" onClick={() => setHistoryIntegration(integration)}><FileClock className="h-4 w-4" />Historial</Button>
                    <Button variant="ghost" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "toggle", integration })}>{integration.is_active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}{integration.is_active ? "Pausar" : "Activar"}</Button>
                    <Button variant="ghost" className="h-9 px-3" onClick={() => setWizardIntegration(integration)}><Pencil className="h-4 w-4" />Editar</Button>
                    <Button variant="danger" className="col-span-2 h-9 px-3" onClick={() => actionMutation.mutate({ type: "delete", integration })}><Trash2 className="h-4 w-4" />Eliminar</Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-[980px] w-full divide-y divide-border text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Integracion</th>
                    <th className="px-3 py-2 font-semibold">Estado</th>
                    <th className="px-3 py-2 font-semibold">Ultima sync</th>
                    <th className="px-3 py-2 font-semibold">Proxima</th>
                    <th className="px-3 py-2 font-semibold">Ultimos contadores</th>
                    <th className="px-3 py-2 font-semibold">CSV</th>
                    <th className="px-3 py-2 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {integrations.map((integration) => (
                    <tr key={integration.id} className="align-top">
                      <td className="px-3 py-4">
                        <p className="font-semibold">{integration.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{integration.integration_type === "rest_api" ? "REST API" : "CSV"} - {integration.sync_mode === "scheduled" ? `cada ${integration.sync_frequency_hours}h` : "manual"}</p>
                      </td>
                      <td className="px-3 py-4"><IntegrationStatusBadge status={integration.last_sync_status} active={integration.is_active} /></td>
                      <td className="px-3 py-4">{formatDate(integration.last_synced_at)}</td>
                      <td className="px-3 py-4">{integration.sync_mode === "scheduled" ? formatDate(integration.next_sync_at) : "-"}</td>
                      <td className="px-3 py-4">
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">C {integration.last_sync_created}</span>
                          <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">A {integration.last_sync_updated}</span>
                          <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">O {integration.last_sync_skipped}</span>
                          <span className="rounded bg-rose-50 px-2 py-1 text-rose-700">E {integration.last_sync_errors}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {integration.integration_type === "csv" ? (
                          <label className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-3 text-sm font-semibold hover:bg-muted">
                            <Upload className="h-4 w-4" />
                            CSV
                            <input className="sr-only" type="file" accept=".csv,text/csv" onChange={(event) => setCsvFiles((current) => ({ ...current, [integration.id]: event.target.files?.[0] }))} />
                          </label>
                        ) : "-"}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "test", integration })}><Activity className="h-4 w-4" />Probar</Button>
                          <Button variant="secondary" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "preview", integration })}><Eye className="h-4 w-4" />Preview</Button>
                          <Button variant="secondary" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "sync", integration })}><RefreshCw className="h-4 w-4" />Sync</Button>
                          <Button variant="secondary" className="h-9 px-3" onClick={() => setHistoryIntegration(integration)}><FileClock className="h-4 w-4" />Historial</Button>
                          <Button variant="ghost" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "toggle", integration })}>{integration.is_active ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}{integration.is_active ? "Pausar" : "Activar"}</Button>
                          <Button variant="ghost" className="h-9 px-3" onClick={() => setWizardIntegration(integration)}><Pencil className="h-4 w-4" />Editar</Button>
                          <Button variant="danger" className="h-9 px-3" onClick={() => actionMutation.mutate({ type: "delete", integration })}><Trash2 className="h-4 w-4" />Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </CardContent>
      </Card>

      {wizardIntegration !== undefined ? <IntegrationWizard initial={wizardIntegration ?? undefined} onClose={() => setWizardIntegration(undefined)} onPlanBlocked={() => setPlanBlocked(true)} /> : null}
      {historyIntegration ? <HistoryPanel integration={historyIntegration} onClose={() => setHistoryIntegration(null)} /> : null}
      {previewIntegration && preview ? (
        <div className="safe-top fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-slate-950/55 p-0 md:items-center md:p-6">
          <div className="safe-bottom flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl bg-white shadow-soft md:rounded-lg">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-white px-5 py-4">
              <div>
                <p className="label">Preview</p>
                <h2 className="mt-1 text-xl font-bold">{previewIntegration.name}</h2>
              </div>
              <button type="button" aria-label="Cerrar" className="focus-ring min-h-11 min-w-11 rounded-md p-2 text-muted-foreground hover:bg-muted md:min-h-0 md:min-w-0" onClick={() => setPreviewIntegration(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto overscroll-contain p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-muted p-3 text-sm"><strong>{preview.total_fetched}</strong> encontrados</div>
                <div className="rounded-md bg-muted p-3 text-sm"><strong>{preview.total_after_filters}</strong> despues de filtros</div>
              </div>
              <DataPreviewTable rows={preview.mapped_preview} />
              {preview.mapping_errors.length ? <FieldError message={preview.mapping_errors.join(" ")} /> : null}
            </div>
          </div>
        </div>
      ) : null}
      <MobileFab icon={PlugZap} label="Nueva" onClick={() => setWizardIntegration(null)} disabled={planBlocked} />
    </div>
  )
}
