import { useMutation, useQuery } from "@tanstack/react-query"
import { Check, Copy, Download, Plus, Save, Search, Send, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import { listCatalogItems } from "@/api/catalog"
import { listClients } from "@/api/clients"
import { downloadQuotePdf, saveQuote, sendQuote } from "@/api/quotes"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { FieldError, TextareaField } from "@/components/ui/Form"
import { Modal } from "@/components/ui/Modal"
import { useConfirm } from "@/components/common/ConfirmDialog"
import { queryKeys } from "@/constants/queryKeys"
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
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientId, setClientId] = useState("")
  const [title, setTitle] = useState("Implementacion Cotix Pro")
  const [issueDate, setIssueDate] = useState(today)
  const [validUntil, setValidUntil] = useState(defaultValidUntil)
  const [notes, setNotes] = useState("Los precios estan sujetos a disponibilidad. Esta cotizacion es valida por el tiempo indicado.")
  const [items, setItems] = useState<QuoteItem[]>([])
  const [savedQuote, setSavedQuote] = useState<Quote | null>(null)
  const [catalogOpen, setCatalogOpen] = useState(false)
  const [catalogSearch, setCatalogSearch] = useState("")
  const [validationError, setValidationError] = useState("")
  const role = useAuthStore((state) => state.user?.role)
  const canEdit = canPerform(role, "edit")
  const canSend = canPerform(role, "sendQuote")
  const canDownload = canPerform(role, "downloadPdf")
  const canCopyLink = canPerform(role, "copyPublicLink")
  const confirm = useConfirm()
  const debouncedCatalogSearch = useDebounce(catalogSearch)

  const clientsQuery = useQuery({
    queryKey: queryKeys.clients(""),
    queryFn: () => listClients(""),
  })
  const catalogQuery = useQuery({
    queryKey: queryKeys.catalogItems(debouncedCatalogSearch),
    queryFn: () => listCatalogItems(debouncedCatalogSearch),
  })

  const totals = useMemo(() => calculateQuoteTotals(items), [items])
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
    currency: "GTQ",
    publicToken: savedQuote?.publicToken,
    notes,
    termsConditions: "Esta cotizacion es valida hasta la fecha indicada.",
  }

  const saveMutation = useMutation({
    mutationFn: saveQuote,
    onSuccess: (quote) => {
      setSavedQuote(quote)
      toast.success("Borrador guardado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
  const sendMutation = useMutation({
    mutationFn: sendQuote,
    onSuccess: () => {
      setSavedQuote((current) => (current ? { ...current, status: "sent" } : current))
      toast.success("Cotizacion enviada.")
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
    const result = quoteSchema.safeParse({ clientId, clientName, title, issueDate, validUntil, items, notes })
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
        taxRate: item.taxRate,
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
    if (confirmed && savedQuote) sendMutation.mutate(savedQuote.id)
  }

  async function copyPublicLink() {
    if (!savedQuote?.publicToken) {
      toast.error("Guarda la cotizacion antes de copiar el link publico.")
      return
    }
    const url = `${import.meta.env.VITE_APP_URL ?? window.location.origin}/q/${savedQuote.publicToken}`
    await navigator.clipboard.writeText(url)
    toast.success("Link publico copiado.")
  }

  if (clientsQuery.isError) {
    return <ErrorState title="No se pudo preparar el constructor" description="No logramos cargar clientes desde la API." onAction={() => void clientsQuery.refetch()} />
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_480px]">
      <section className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="label">Constructor</p>
                <h2 className="mt-1 text-xl font-bold">Nueva cotizacion</h2>
                {validationError ? <FieldError message={validationError} /> : null}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <Button variant="secondary" disabled={!canEdit} loading={saveMutation.isPending} onClick={handleSave}><Save className="h-4 w-4" />Guardar</Button>
                <Button variant="secondary" disabled={!canCopyLink || !savedQuote?.publicToken} onClick={copyPublicLink}><Copy className="h-4 w-4" />Link</Button>
                <Button variant="secondary" disabled={!canDownload || !savedQuote} loading={pdfMutation.isPending} onClick={() => savedQuote && pdfMutation.mutate(savedQuote.id)}><Download className="h-4 w-4" />PDF</Button>
                <Button disabled={!canSend || !savedQuote} loading={sendMutation.isPending} onClick={handleSend}><Send className="h-4 w-4" />Enviar</Button>
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
              <input className="field mt-2" type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} />
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
              const lineTotals = calculateQuoteLineTotals(item)
              const discountPercent = Math.round(item.discountRate * 10000) / 100
              const taxPercent = Math.round(item.taxRate * 10000) / 100

              return (
                <div key={item.id} className="rounded-lg border border-border bg-white p-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_88px_130px_110px_100px_42px] lg:items-end">
                    <label>
                      <span className="label">Item</span>
                      <input className="field mt-2" disabled={!canEdit} value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} />
                    </label>
                    <label>
                      <span className="label">Cant.</span>
                      <input className="field mt-2" disabled={!canEdit} type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(item.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} />
                    </label>
                    <label>
                      <span className="label">Precio</span>
                      <input className="field mt-2" disabled={!canEdit} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(item.id, { unitPrice: Number(event.target.value) })} />
                    </label>
                    <label>
                      <span className="label">Desc. %</span>
                      <input
                        className="field mt-2"
                        disabled={!canEdit}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0-100"
                        value={discountPercent}
                        onChange={(event) => updateItem(item.id, { discountRate: normalizePercentInput(event.target.value) / 100 })}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">Max. 100%</p>
                    </label>
                    <label>
                      <span className="label">IVA %</span>
                      <input className="field mt-2" disabled={!canEdit} type="number" min="0" max="100" step="0.01" placeholder="0-100" value={taxPercent} onChange={(event) => updateItem(item.id, { taxRate: normalizePercentInput(event.target.value) / 100 })} />
                    </label>
                    <Button variant="ghost" disabled={!canEdit} className="h-11 w-11 px-0" aria-label="Eliminar item" onClick={() => removeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-col justify-between gap-2 border-t border-border pt-3 text-sm text-muted-foreground sm:flex-row">
                    <span>{item.description}</span>
                    <strong className="text-foreground">{formatCurrency(lineTotals.total)}</strong>
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
          <CardContent>
            <TextareaField label="Notas visibles" disabled={!canEdit} value={notes} onChange={(event) => setNotes(event.target.value)} />
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
                  <p className="text-xl font-bold">Distribuidora Garcia</p>
                  <p className="mt-1 text-sm text-muted-foreground">ventas@distribuidoragarcia.gt</p>
                </div>
                <div className="rounded-md bg-primary px-3 py-2 text-sm font-bold text-white">COTIX</div>
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
                    <strong>{formatCurrency(calculateQuoteLineTotals(item).taxableSubtotal)}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(totals.subtotal)}</strong></div>
                <div className="flex justify-between"><span>Descuentos</span><strong>-{formatCurrency(totals.discount)}</strong></div>
                <div className="flex justify-between"><span>Base imponible</span><strong>{formatCurrency(totals.taxableSubtotal)}</strong></div>
                <div className="flex justify-between"><span>Impuestos</span><strong>{formatCurrency(totals.tax)}</strong></div>
                <div className="flex justify-between border-t border-border pt-3 text-lg"><span>Total</span><strong>{formatCurrency(totals.total)}</strong></div>
              </div>
              <p className="mt-5 rounded-md bg-slate-50 p-3 text-xs leading-5 text-muted-foreground">{notes}</p>
            </div>
          </CardContent>
        </Card>
      </aside>

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
                  <strong>{formatCurrency(item.unitPrice)}</strong>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
