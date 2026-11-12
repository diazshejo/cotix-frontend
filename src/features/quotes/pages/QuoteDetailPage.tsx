import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Copy, Download, Pencil, Send } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { downloadQuotePdf, getQuote, publishQuote, sendQuote } from "@/api/quotes"
import { getApiErrorMessage } from "@/api/client"
import { StatusBadge } from "@/components/common/StatusBadge"
import { useConfirm } from "@/components/common/ConfirmDialog"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { queryKeys } from "@/constants/queryKeys"
import { routes } from "@/constants/routes"
import { formatCurrency } from "@/utils/currency"
import { calculateQuoteTotals } from "@/utils/quoteCalculator"
import { useAuthStore } from "@/stores/authStore"
import { canPerform } from "@/utils/permissions"

export default function QuoteDetailPage() {
  const { id = "" } = useParams()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const role = useAuthStore((state) => state.user?.role)
  const { data: quote, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.quote(id),
    queryFn: () => getQuote(id),
    enabled: Boolean(id),
  })

  const sendMutation = useMutation({
    mutationFn: sendQuote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.quote(id) })
      void queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast.success("Cotizacion enviada.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
  const publishMutation = useMutation({
    mutationFn: publishQuote,
    onSuccess: (published) => {
      queryClient.setQueryData(queryKeys.quote(id), published)
      void queryClient.invalidateQueries({ queryKey: ["quotes"] })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
  const pdfMutation = useMutation({
    mutationFn: downloadQuotePdf,
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${quote?.number ?? "cotizacion"}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("PDF descargado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  if (isLoading) return <LoadingState title="Cargando cotizacion" />
  if (isError || !quote) {
    return <ErrorState title="No se pudo cargar la cotizacion" description="El backend no respondio correctamente." onAction={() => void refetch()} />
  }

  const totals = quote.totals ?? calculateQuoteTotals(quote.items, quote.taxRate === undefined ? undefined : quote.taxRate / 100, quote.pricesIncludeTax)
  const publicUrl = quote.publicToken ? `${import.meta.env.VITE_APP_URL ?? window.location.origin}/q/${quote.publicToken}` : ""

  async function copyPublicLink() {
    if (!publicUrl) return
    if (quote?.status === "draft") {
      if (!canPerform(role, "sendQuote")) return
      const approved = await confirm({
        title: "Publicar y copiar enlace",
        description: "La cotización pasará a enviada y el cliente podrá aceptarla desde el enlace. No se enviará un correo.",
        confirmLabel: "Publicar y copiar",
      })
      if (!approved) return
      try {
        await publishMutation.mutateAsync(quote.id)
      } catch {
        return
      }
    }
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success("Enlace público copiado.")
    } catch {
      toast.error("No se pudo copiar el enlace.")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Link className="text-sm font-semibold text-primary" to={routes.quotes}>Volver a cotizaciones</Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold">{quote.number}</h2>
            <StatusBadge status={quote.status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{quote.clientName} - valida hasta {quote.validUntil}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {quote.status === "draft" && <Link className="focus-ring inline-flex h-10 min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground hover:bg-muted sm:min-h-10" to={routes.editQuote(quote.id)}><Pencil className="h-4 w-4" />Editar</Link>}
          <Button variant="secondary" disabled={!publicUrl || (quote.status === "draft" && !canPerform(role, "sendQuote"))} loading={publishMutation.isPending} onClick={copyPublicLink}><Copy className="h-4 w-4" />Link</Button>
          <Button variant="secondary" loading={pdfMutation.isPending} onClick={() => pdfMutation.mutate(quote.id)}><Download className="h-4 w-4" />PDF</Button>
          <Button disabled={quote.status !== "draft"} loading={sendMutation.isPending} onClick={() => sendMutation.mutate(quote.id)}><Send className="h-4 w-4" />Enviar</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <p className="label">Lineas</p>
            <h3 className="mt-1 text-lg font-bold">Productos y servicios cotizados</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {quote.items.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-white p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <strong>{formatCurrency(item.lineTotal ?? item.quantity * item.unitPrice * (1 - item.discountRate), quote.currency)}</strong>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <span>Cantidad: {item.quantity}</span>
                  <span>Precio: {formatCurrency(item.unitPrice, quote.currency)}</span>
                  <span>Impuesto: {item.taxable ? `${quote.taxRate ?? 0}%` : "No aplica"}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="label">Resumen</p>
            <h3 className="mt-1 text-lg font-bold">Totales</h3>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(totals.subtotal, quote.currency)}</strong></div>
            <div className="flex justify-between"><span>Descuentos</span><strong>-{formatCurrency(totals.discount, quote.currency)}</strong></div>
            <div className="flex justify-between"><span>Impuestos</span><strong>{formatCurrency(totals.tax, quote.currency)}</strong></div>
            <div className="flex justify-between border-t border-border pt-4 text-xl"><span>Total</span><strong>{formatCurrency(totals.total, quote.currency)}</strong></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
