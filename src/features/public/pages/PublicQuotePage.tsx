import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Download, X } from "lucide-react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import { acceptPublicQuote, downloadQuotePdf, getPublicQuote, rejectPublicQuote } from "@/api/quotes"
import { useConfirm } from "@/components/common/ConfirmDialog"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { queryKeys } from "@/constants/queryKeys"
import { formatCurrency } from "@/utils/currency"
import { calculateQuoteTotals } from "@/utils/quoteCalculator"

export default function PublicQuotePage() {
  const { token = "" } = useParams()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const { data: quote, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.publicQuote(token),
    queryFn: () => getPublicQuote(token),
  })

  const respondMutation = useMutation({
    mutationFn: (decision: "accept" | "reject") => (decision === "accept" ? acceptPublicQuote(token) : rejectPublicQuote(token)),
    onSuccess: (updatedQuote) => {
      toast.success(updatedQuote.status === "accepted" ? "Cotizacion aceptada." : "Respuesta registrada.")
      queryClient.setQueryData(queryKeys.publicQuote(token), updatedQuote)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const pdfMutation = useMutation({
    mutationFn: () => downloadQuotePdf(quote!.id),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${quote!.number}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("PDF descargado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  if (isLoading) return <LoadingState title="Cargando cotizacion" />
  if (isError || !quote) {
    return (
      <ErrorState
        title="Este enlace no existe o ya no esta disponible"
        description="Verifica el enlace recibido o solicita una cotizacion actualizada."
        onAction={() => void refetch()}
      />
    )
  }

  const totals = calculateQuoteTotals(quote.items)
  const canRespond = quote.status === "sent" || quote.status === "viewed"
  async function rejectQuote() {
    const confirmed = await confirm({
      title: "Rechazar cotizacion",
      description: "Registraremos que esta cotizacion no es de tu interes. Podras solicitar una nueva propuesta al equipo comercial.",
      confirmLabel: "Rechazar",
      tone: "danger",
    })
    if (confirmed) respondMutation.mutate("reject")
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="overflow-hidden bg-white">
        <div className="border-b border-border bg-slate-950 px-5 py-6 text-white sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xl font-bold">Distribuidora Garcia S.A.</p>
              <p className="mt-1 text-sm text-slate-300">Quetzaltenango, Guatemala</p>
            </div>
            <div className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950">COTIX</div>
          </div>
        </div>

        <CardContent className="p-5 sm:p-8">
          <section className="grid gap-6 border-b border-border pb-6 md:grid-cols-[1fr_260px]">
            <div>
              <p className="label">Cotizacion</p>
              <h1 className="mt-2 text-3xl font-bold">{quote.number}</h1>
              <p className="mt-3 text-sm text-muted-foreground">Para: {quote.clientName}</p>
              <p className="mt-1 text-sm text-muted-foreground">Valida hasta: {quote.validUntil}</p>
            </div>
            <div className="rounded-lg bg-accent p-5 text-accent-foreground">
              <p className="text-sm font-semibold">Total</p>
              <p className="mt-2 text-3xl font-bold">{formatCurrency(totals.total)}</p>
              <p className="mt-2 text-xs">Incluye IVA</p>
            </div>
          </section>

          <section className="py-6">
            <div className="grid gap-3 sm:hidden">
              {quote.items.map((item) => (
                <article key={item.id} className="rounded-lg border border-border bg-white p-4">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div><span className="label">Cant.</span><p>{item.quantity}</p></div>
                    <div><span className="label">Precio</span><p>{formatCurrency(item.unitPrice)}</p></div>
                    <div><span className="label">Total</span><p className="font-bold">{formatCurrency(item.quantity * item.unitPrice * (1 - item.discountRate))}</p></div>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="py-3 font-semibold">Descripcion</th>
                    <th className="py-3 text-center font-semibold">Cant.</th>
                    <th className="py-3 text-right font-semibold">Precio</th>
                    <th className="py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4">
                        <p className="font-semibold">{item.name}</p>
                        <p className="mt-1 text-muted-foreground">{item.description}</p>
                      </td>
                      <td className="py-4 text-center">{item.quantity}</td>
                      <td className="py-4 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-4 text-right font-bold">{formatCurrency(item.quantity * item.unitPrice * (1 - item.discountRate))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto mt-6 max-w-sm space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(totals.subtotal)}</strong></div>
              <div className="flex justify-between"><span>Descuentos</span><strong>-{formatCurrency(totals.discount)}</strong></div>
              <div className="flex justify-between"><span>Impuestos</span><strong>{formatCurrency(totals.tax)}</strong></div>
              <div className="flex justify-between border-t border-border pt-3 text-xl"><span>Total</span><strong>{formatCurrency(totals.total)}</strong></div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-slate-50 p-5">
            <p className="font-semibold">Notas y terminos</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Esta cotizacion es valida por el tiempo indicado. Los precios estan sujetos a disponibilidad.
            </p>
          </section>

          <section className="mt-6 rounded-lg border border-border bg-white p-5 text-center">
            {canRespond ? (
              <>
                <h2 className="text-lg font-bold">Esta cotizacion es de tu interes?</h2>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button variant="success" loading={respondMutation.isPending} onClick={() => respondMutation.mutate("accept")}><Check className="h-4 w-4" />Aceptar cotizacion</Button>
                  <Button variant="danger" loading={respondMutation.isPending} onClick={rejectQuote}><X className="h-4 w-4" />Rechazar</Button>
                  <Button variant="secondary" loading={pdfMutation.isPending} onClick={() => pdfMutation.mutate()}><Download className="h-4 w-4" />Descargar PDF</Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">{quote.status === "accepted" ? "Gracias. Has aceptado esta cotizacion." : "Respuesta registrada"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {quote.status === "accepted"
                    ? "El equipo comercial se pondra en contacto contigo pronto."
                    : "Esta cotizacion ya no requiere una accion adicional."}
                </p>
                <Button className="mt-5" variant="secondary" loading={pdfMutation.isPending} onClick={() => pdfMutation.mutate()}><Download className="h-4 w-4" />Descargar PDF</Button>
              </>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
