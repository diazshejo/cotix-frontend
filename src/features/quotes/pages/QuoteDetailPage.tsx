import { useMutation, useQuery } from "@tanstack/react-query"
import { Copy, Download, Send } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { toast } from "sonner"
import { downloadQuotePdf, getQuote, sendQuote } from "@/api/quotes"
import { getApiErrorMessage } from "@/api/client"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { queryKeys } from "@/constants/queryKeys"
import { routes } from "@/constants/routes"
import { formatCurrency } from "@/utils/currency"
import { calculateQuoteTotals } from "@/utils/quoteCalculator"

export default function QuoteDetailPage() {
  const { id = "" } = useParams()
  const { data: quote, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.quote(id),
    queryFn: () => getQuote(id),
    enabled: Boolean(id),
  })

  const sendMutation = useMutation({
    mutationFn: sendQuote,
    onSuccess: () => toast.success("Cotizacion enviada."),
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

  const totals = calculateQuoteTotals(quote.items)
  const publicUrl = quote.publicToken ? `${import.meta.env.VITE_APP_URL ?? window.location.origin}/q/${quote.publicToken}` : ""

  async function copyPublicLink() {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl)
    toast.success("Link publico copiado.")
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
          <p className="mt-2 text-sm text-muted-foreground">{quote.clientName} · valida hasta {quote.validUntil}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="secondary" disabled={!publicUrl} onClick={copyPublicLink}><Copy className="h-4 w-4" />Link</Button>
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
                  <strong>{formatCurrency(item.quantity * item.unitPrice * (1 - item.discountRate), quote.currency)}</strong>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <span>Cantidad: {item.quantity}</span>
                  <span>Precio: {formatCurrency(item.unitPrice, quote.currency)}</span>
                  <span>IVA: {item.taxRate * 100}%</span>
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
