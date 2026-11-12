import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Check, Copy, Download, Plus, Save, Search, Send, Trash2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { getApiErrorMessage, isPlanRestriction } from "@/api/client"
import { listCatalogItems } from "@/api/catalog"
import { listClients } from "@/api/clients"
import { downloadQuotePdf, getQuote, publishQuote, saveQuote, sendQuote } from "@/api/quotes"
import { getCompanySettings } from "@/api/settings"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { FieldError, TextareaField } from "@/components/ui/Form"
import { Modal } from "@/components/ui/Modal"
import { useConfirm } from "@/components/common/ConfirmDialog"
import { queryKeys } from "@/constants/queryKeys"
import { routes } from "@/constants/routes"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuthStore } from "@/stores/authStore"
import type { CatalogItem } from "@/types/catalog"
import type { Quote, QuoteItem } from "@/types/quote"
import { formatCurrency } from "@/utils/currency"
import { calculateQuoteLineTotals, calculateQuoteTotals } from "@/utils/quoteCalculator"
import { quoteSchema } from "@/utils/validators"
import { canPerform } from "@/utils/permissions"

const today = new Date().toISOString().slice(0, 10)
const defaultValidUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

function normalizePercentInput(value: string) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 0
  return Math.min(100, Math.max(0, Math.round(numericValue * 100) / 100))
}

export default function QuoteBuilderPage() {
  const navigate = useNavigate()
  const { id = "" } = useParams()
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientId, setClientId] = useState("")
  const [title, setTitle] = useState("Implementacion Cotix Pro")
  const [issueDate, setIssueDate] = useState(today)
  const [validUntil, setValidUntil] = useState(defaultValidUntil)
  const [notes, setNotes] = useState("Los precios estan sujetos a disponibilidad. Esta cotizacion es valida por el tiempo indicado.")
  const [termsConditions, setTermsConditions] = useState("")
  const [items, setItems] = useState<QuoteItem[]>([])
  const [savedQuote, setSavedQuote] = useState<Quote | null>(null)
  const hydratedQuoteId = useRef("")
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState("")
  const [validationError, setValidationError] = useState("")
  const [planLimitHit, setPlanLimitHit] = useState(false)
  const [planLimitMessage, setPlanLimitMessage] = useState("")
  const role = useAuthStore((state) => state.user?.role)
  const queryClient = useQueryClient()
  const canEdit = canPerform(role, "edit") && (!savedQuote || savedQuote.status === "draft")
  const canSend = canPerform(role, "sendQuote") && (!savedQuote || savedQuote.status === "draft")
  const canDownload = canPerform(role, "downloadPdf")
  const canCopyLink = canPerform(role, "copyPublicLink")
  const confirm = useConfirm()
  const debouncedCatalogSearch = useDebounce(catalogSearch)

  const settingsQuery = useQuery({
    queryKey: queryKeys.companySettings,
    queryFn: getCompanySettings,
    staleTime: 5 * 60 * 1000,
  })
  const existingQuoteQuery = useQuery({
    queryKey: queryKeys.quote(id),
    queryFn: () => getQuote(id),
    enabled: Boolean(id),
  })
  useEffect(() => {
    const quote = existingQuoteQuery.data
    if (!quote || hydratedQuoteId.current === quote.id) return
    hydratedQuoteId.current = quote.id
    setSavedQuote(quote)
    setClientId(quote.clientId ?? "")
    setClientName(quote.clientName)
    setClientEmail(quote.clientEmail)
    setTitle(quote.title ?? quote.number)
    setIssueDate(quote.issueDate)
    setValidUntil(quote.validUntil)
    setNotes(quote.notes ?? "")
    setTermsConditions(quote.termsConditions ?? "")
    setItems(quote.items)
  }, [existingQuoteQuery.data])
  const clientsQuery = useQuery({
    queryKey: queryKeys.clients(""),
    queryFn: () => listClients(""),
  })
  const catalogQuery = useQuery({
    queryKey: queryKeys.catalogItems(debouncedCatalogSearch),
    queryFn: () => listCatalogItems(debouncedCatalogSearch),
  })

  const taxRate = savedQuote?.taxRate ?? settingsQuery.data?.taxRate ?? 12
  const pricesIncludeTax = savedQuote?.pricesIncludeTax ?? settingsQuery.data?.pricesIncludeTax ?? false
  const currency = savedQuote?.currency ?? settingsQuery.data?.defaultCurrency ?? "GTQ"
  const totals = useMemo(() => calculateQuoteTotals(items, taxRate / 100, pricesIncludeTax), [items, taxRate, pricesIncludeTax])
  const payload: Quote = {
    id: savedQuote?.id ?? "",
    clientId,
    number: savedQuote?.number ?? "Borrador nuevo",
    title,
    clientName,
    clientEmail,
    status: savedQuote?.status ?? "draft",
    issueDate,
    validUntil,
    items,
    total: totals.total,
    currency,
    publicToken: savedQuote?.publicToken,
    notes,
    termsConditions,
  }

  const saveMutation = useMutation({
    mutationFn: saveQuote,
    onSuccess: (quote) => {
      setSavedQuote(quote)
      setItems(quote.items)
      toast.success("Borrador guardado.")
      queryClient.setQueryData(queryKeys.quote(quote.id), quote)
      void queryClient.invalidateQueries({ queryKey: ["quotes"] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.planUsage })
    },
    onError: (error) => {
      if (isPlanRestriction(error)) {
        setPlanLimitMessage(getApiErrorMessage(error))
        setPlanLimitHit(true)
      } else {
        toast.error(getApiErrorMessage(error))
      }
    },
  })
  const sendMutation = useMutation({
    mutationFn: async (draft: Quote) => {
      const saved = await saveQuote(draft)
      setSavedQuote(saved)
      setItems(saved.items)
      await sendQuote(saved.id)
      return saved
    },
    onSuccess: () => {
      setSavedQuote((current) => (current ? { ...current, status: "sent" } : current))
      void queryClient.invalidateQueries({ queryKey: ["quotes"] })
      if (savedQuote) void queryClient.invalidateQueries({ queryKey: queryKeys.quote(savedQuote.id) })
      toast.success("Cotizacion enviada.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
  const publishMutation = useMutation({
    mutationFn: async (draft: Quote) => publishQuote((await saveQuote(draft)).id),
    onSuccess: (published) => {
      setSavedQuote(published)
      void queryClient.invalidateQueries({ queryKey: ["quotes"] })
      void queryClient.invalidateQueries({ queryKey: queryKeys.quote(published.id) })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
  const pdfMutation = useMutation({
    mutationFn: downloadQuotePdf,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${payload.number}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("PDF descargado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  function validateQuote() {
    const result = quoteSchema.safeParse({ clientId, clientName, title, issueDate, validUntil, items, notes, termsConditions })
    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? "Revisa la cotizacion.")
      return false
    }
    setValidationError("")
    return true
  }

  function addCatalogItem(item: CatalogItem) {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: item.name,
        description: item.description,
        quantity: 1,
        unitPrice: item.unitPrice,
        discountRate: 0,
        taxRate: item.taxRate > 0 ? taxRate / 100 : 0,
        taxable: item.taxRate > 0,
        discountType: "none",
      },
    ])
    setCatalogOpen(false)
  }

  function updateItem(id: string, changes: Partial<QuoteItem>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  function handleSave() {
    if (validateQuote()) saveMutation.mutate(payload)
  }

  async function handleSend() {
    if (!validateQuote()) return
    const confirmed = await confirm({
      title: "Enviar cotizacion",
      description: "Se enviara esta cotizacion al cliente usando los canales configurados en el backend.",
      confirmLabel: "Enviar cotizacion",
    })
    if (confirmed && savedQuote) sendMutation.mutate(payload)
  }

  async function copyPublicLink() {
    if (!savedQuote?.publicToken) {
      toast.error("Guarda la cotización antes de compartirla.")
      return
    }
    let shared = savedQuote
    if (shared.status === "draft") {
      if (!canSend || !validateQuote()) return
      const approved = await confirm({
        title: "Publicar y copiar enlace",
        description: "La cotización pasará a enviada y el cliente podrá aceptarla desde el enlace. No se enviará un correo.",
        confirmLabel: "Publicar y copiar",
      })
      if (!approved) return
      try {
        shared = await publishMutation.mutateAsync(payload)
      } catch {
        return
      }
    }
    if (!shared.publicToken) return
    try {
      await navigator.clipboard.writeText(`${import.meta.env.VITE_APP_URL ?? window.location.origin}/q/${shared.publicToken}`)
      toast.success("Enlace público copiado.")
    } catch {
      toast.error("No se pudo copiar el enlace.")
    }
  }

  if (id && existingQuoteQuery.isLoading) return <LoadingState title="Cargando cotizacion" />
  if (id && existingQuoteQuery.isError) {
    return <ErrorState title="No se pudo cargar la cotizacion" description="Revisa el borrador e intenta de nuevo." onAction={() => void existingQuoteQuery.refetch()} />
  }
  if (id && savedQuote?.id !== id) return <LoadingState title="Preparando borrador" />
  if (clientsQuery.isError) {
    return <ErrorState title="No se pudo preparar el constructor" description="No logramos cargar clientes desde la API." onAction={() => void clientsQuery.refetch()} />
  }

  return (
    <div className="grid gap-6 pb-32 lg:pb-0 2xl:grid-cols-[minmax(0,1fr)_480px]">
      <section className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="label">Constructor</p>
                <h2 className="mt-1 text-xl font-bold">{id ? `Editar ${savedQuote?.number ?? "cotizacion"}` : "Nueva cotizacion"}</h2>
                {validationError ? <FieldError message={validationError} /> : null}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Button variant="secondary" disabled={!canEdit || sendMutation.isPending || settingsQuery.isLoading} loading={saveMutation.isPending} onClick={handleSave}><Save className="h-4 w-4" />Guardar</Button>
                <Button variant="secondary" disabled={!canCopyLink || !savedQuote?.publicToken || (savedQuote.status === "draft" && !canSend)} loading={publishMutation.isPending} onClick={copyPublicLink}><Copy className="h-4 w-4" />Link</Button>
                <Button variant="secondary" disabled={!canDownload || !savedQuote} loading={pdfMutation.isPending} onClick={() => savedQuote && pdfMutation.mutate(savedQuote.id)}><Download className="h-4 w-4" />PDF</Button>
                <Button disabled={!canSend || !savedQuote || saveMutation.isPending} loading={sendMutation.isPending} onClick={handleSend}><Send className="h-4 w-4" />Enviar</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="label">Cliente</span>
              {clientsQuery.isLoading ? (
                <div className="field mt-2 flex items-center text-muted-foreground">Cargando clientes...</div>
              ) : (
                <select
                  className="field mt-2"
                  value={clientId}
                  onChange={(event) => {
                    const selected = clientsQuery.data?.find((client) => client.id === event.target.value)
                    setClientId(event.target.value)
                    if (selected) {
                      setClientName(selected.name)
                      setClientEmail(selected.email)
                    }
                  }}
                >
                  <option value="">Selecciona cliente</option>
                  {clientsQuery.data?.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              )}
            </label>
            <label>
              <span className="label">Titulo</span>
              <input className="field mt-2" value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              <span className="label">Fecha de emision</span>
              <input className="field mt-2" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} />
            </label>
            <label>
              <span className="label">Valida hasta</span>
              <input className="field mt-2" type="date" min={issueDate} value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
            </label>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="label">Lineas</p>
                <h3 className="mt-1 text-lg font-bold">Productos y servicios</h3>
              </div>
              <Button variant="secondary" disabled={!canEdit} onClick={() => setCatalogOpen(true)}><Plus className="h-4 w-4" />Agregar item</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center">
                <p className="font-semibold">Agrega al menos un item</p>
                <p className="mt-2 text-sm text-muted-foreground">El preview y los totales se actualizaran en tiempo real.</p>
              </div>
            ) : null}
            {items.map((item) => {
              const lineTotals = calculateQuoteLineTotals(item, taxRate / 100, pricesIncludeTax)
              const discountPercent = Math.round(item.discountRate * 10000) / 100

              return (
                <div key={item.id} className="rounded-lg border border-border bg-white p-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_88px_130px_110px_100px_42px] lg:items-end">
                    <label>
                      <span className="label">Item</span>
                      <input className="field mt-2" disabled={!canEdit} value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} />
                    </label>
                    <label>
                      <span className="label">Cant.</span>
                      <input className="field mt-2" disabled={!canEdit} type="number" min="0.0001" step="0.0001" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Math.max(0.0001, Number(event.target.value) || 0.0001) })} />
                    </label>
                    <label>
                      <span className="label">Precio</span>
                      <input className="field mt-2" disabled={!canEdit} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(item.id, { unitPrice: Number(event.target.value) })} />
                    </label>
                    <div>
                      <span className="label">Descuento</span>
                      <select
                        className="field mt-2"
                        aria-label={`Tipo de descuento de ${item.name}`}
                        disabled={!canEdit}
                        value={item.discountType === "fixed" ? "fixed" : "percent"}
                        onChange={(event) => updateItem(item.id, {
                          discountType: event.target.value === "fixed" ? "fixed" : "none",
                          discountRate: 0,
                          discountValue: 0,
                        })}
                      >
                        <option value="percent">%</option>
                        <option value="fixed">Monto</option>
                      </select>
                      <input
                        className="field mt-2"
                        aria-label={`Valor del descuento de ${item.name}`}
                        disabled={!canEdit}
                        type="number"
                        min="0"
                        max={item.discountType === "fixed" ? item.quantity * item.unitPrice : 100}
                        step="0.01"
                        value={item.discountType === "fixed" ? item.discountValue ?? 0 : discountPercent}
                        onChange={(event) => {
                          if (item.discountType === "fixed") {
                            const discountValue = Math.min(item.quantity * item.unitPrice, Math.max(0, Number(event.target.value) || 0))
                            updateItem(item.id, { discountValue })
                            return
                          }
                          const discountRate = normalizePercentInput(event.target.value) / 100
                          updateItem(item.id, { discountRate, discountType: discountRate > 0 ? "percent" : "none", discountValue: discountRate * 100 })
                        }}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled={!canEdit} checked={item.taxable ?? item.taxRate > 0} onChange={(event) => updateItem(item.id, { taxable: event.target.checked, taxRate: event.target.checked ? taxRate / 100 : 0 })} />
                      {settingsQuery.data?.taxLabel ?? "Impuesto"} {taxRate}%
                    </label>
                    <Button variant="ghost" disabled={!canEdit} className="h-11 w-11 px-0" aria-label="Eliminar item" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-col justify-between gap-2 border-t border-border pt-3 text-sm text-muted-foreground sm:flex-row">
                    <span>{item.description}</span>
                    <strong className="text-foreground">{formatCurrency(lineTotals.total, currency)}</strong>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="label">Notas y terminos</p>
            <h3 className="mt-1 text-lg font-bold">Texto para el cliente</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField label="Notas visibles al cliente" disabled={!canEdit} value={notes} onChange={(event) => setNotes(event.target.value)} />
            <TextareaField label="Terminos y condiciones" disabled={!canEdit} value={termsConditions} onChange={(event) => setTermsConditions(event.target.value)} />
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="label">Preview en vivo</p>
                <h3 className="mt-1 text-lg font-bold">{savedQuote?.number ?? "Sin guardar"}</h3>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Check className="mr-1 inline h-3.5 w-3.5" />
                Actualizado
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between border-b border-border pb-5">
                <div>
                  <p className="text-xl font-bold">{settingsQuery.data?.tradeName || settingsQuery.data?.businessName || "Tu empresa"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{settingsQuery.data?.email || ""}</p>
                </div>
                {settingsQuery.data?.logoUrl ? (
                  <img src={settingsQuery.data.logoUrl} alt="Logo" className="h-10 max-w-[120px] object-contain" />
                ) : (
                  <div className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-white">{settingsQuery.data?.quotePrefix || "COT"}</div>
                )}
              </div>
              <div className="py-5">
                <p className="label">Para</p>
                <h4 className="mt-1 font-bold">{clientName}</h4>
                <p className="mt-1 text-sm text-muted-foreground">Valida hasta {validUntil}</p>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 border-b border-border pb-3 text-sm">
                    <span>{item.name}</span>
                    <strong>{formatCurrency(calculateQuoteLineTotals(item, taxRate / 100, pricesIncludeTax).taxableSubtotal, currency)}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(totals.subtotal, currency)}</strong></div>
                <div className="flex justify-between"><span>Descuentos</span><strong>-{formatCurrency(totals.discount, currency)}</strong></div>
                <div className="flex justify-between"><span>Base imponible</span><strong>{formatCurrency(totals.taxableSubtotal, currency)}</strong></div>
                <div className="flex justify-between"><span>Impuestos</span><strong>{formatCurrency(totals.tax, currency)}</strong></div>
                <div className="flex justify-between border-t border-border pt-3 text-lg"><span>Total</span><strong>{formatCurrency(totals.total, currency)}</strong></div>
              </div>
              <p className="mt-5 rounded-md bg-slate-50 p-3 text-xs leading-5 text-muted-foreground">{notes}</p>
            </div>
          </CardContent>
        </Card>
      </aside>

      <Modal
        open={planLimitHit}
        title="Acción no disponible en tu plan"
        description={planLimitMessage}
        onClose={() => setPlanLimitHit(false)}
      >
        <div className="space-y-5">
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Revisa tu plan</p>
              <p className="mt-1 leading-5">{planLimitMessage}</p>
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">Plan Pro — $15/mes</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Cotizaciones ilimitadas cada mes</li>
              <li>• Hasta 3 usuarios en tu equipo</li>
              <li>• Integraciones con APIs externas de catalogo</li>
            </ul>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPlanLimitHit(false)}>Cerrar</Button>
            <Button type="button" onClick={() => navigate(routes.settingsBilling)}>Actualizar plan</Button>
          </div>
        </div>
      </Modal>

      <Modal open={catalogOpen} title="Agregar desde catalogo" description="Busca productos o servicios existentes y agregalos a la cotizacion." onClose={() => setCatalogOpen(false)}>
        <div className="mb-4 flex h-11 items-center gap-2 rounded-md border border-input bg-white px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input className="w-full border-0 bg-transparent text-sm outline-none" placeholder="Buscar en catalogo" value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} />
        </div>
        {catalogQuery.isLoading ? <LoadingState title="Buscando items" /> : null}
        {catalogQuery.isError ? <ErrorState title="No se pudo cargar catalogo" description="Intenta nuevamente." onAction={() => void catalogQuery.refetch()} /> : null}
        {!catalogQuery.isLoading && !catalogQuery.isError ? (
          <div className="space-y-3">
            {catalogQuery.data?.map((item) => (
              <button
                key={item.id}
                className="focus-ring w-full rounded-lg border border-border bg-white p-4 text-left transition hover:border-primary hover:bg-accent/35"
                onClick={() => addCatalogItem(item)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <strong>{formatCurrency(item.unitPrice, currency)}</strong>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </Modal>

      <div className="mobile-sticky-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-4 pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto max-w-3xl">
          <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="label">Subtotal</span>
              <p className="font-semibold">{formatCurrency(totals.subtotal, currency)}</p>
            </div>
            <div className="text-right">
              <span className="label">Total</span>
              <p className="text-lg font-bold">{formatCurrency(totals.total, currency)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" disabled={!canEdit} onClick={() => setCatalogOpen(true)}><Plus className="h-4 w-4" />Agregar item</Button>
            <Button disabled={!canEdit || sendMutation.isPending || settingsQuery.isLoading} loading={saveMutation.isPending} onClick={handleSave}><Save className="h-4 w-4" />Guardar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
