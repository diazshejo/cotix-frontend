import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Download, MessageSquare, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/api/client"
import { acceptPublicQuote, downloadPublicQuotePdf, getPublicQuote, rejectPublicQuote, requestPublicQuoteChanges } from "@/api/quotes"
import { applyBrandColor } from "@/utils/color"
import { useConfirm } from "@/components/common/ConfirmDialog"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { queryKeys } from "@/constants/queryKeys"
import { formatCurrency } from "@/utils/currency"
import { calculateQuoteTotals } from "@/utils/quoteCalculator"
import type { SignatureStrokes } from "@/types/quote"
import { SignaturePad } from "./SignaturePad"

export default function PublicQuotePage() {
  const { token = "" } = useParams()
  const queryClient = useQueryClient()
  const confirm = useConfirm()
  const [responseMode, setResponseMode] = useState<"sign" | "changes" | null>(null)
  const [signerName, setSignerName] = useState("")
  const [signatureStrokes, setSignatureStrokes] = useState<SignatureStrokes>([])
  const [consent, setConsent] = useState(false)
  const [changeMessage, setChangeMessage] = useState("")
  const { data: quote, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.publicQuote(token),
    queryFn: () => getPublicQuote(token),
  })

  useEffect(() => {
    if (quote?.companyPrimaryColor) applyBrandColor(quote.companyPrimaryColor)
  }, [quote?.companyPrimaryColor])

  const respondMutation = useMutation({
    mutationFn: (decision: "accept" | "reject" | "changes") => {
      if (decision === "accept") return acceptPublicQuote(token, signerName.trim(), signatureStrokes)
      if (decision === "changes") return requestPublicQuoteChanges(token, changeMessage.trim())
      return rejectPublicQuote(token)
    },
    onSuccess: (updatedQuote) => {
      toast.success(updatedQuote.status === "accepted" ? "Cotización firmada y aceptada." : "Respuesta registrada.")
      setResponseMode(null)
      queryClient.setQueryData(queryKeys.publicQuote(token), updatedQuote)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  const pdfMutation = useMutation({
    mutationFn: () => downloadPublicQuotePdf(token),
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

  const totals = quote.totals ?? calculateQuoteTotals(quote.items, quote.taxRate === undefined ? undefined : quote.taxRate / 100, quote.pricesIncludeTax)
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
              <p className="text-xl font-bold">{quote.companyName || "Empresa"}</p>
              {(quote.companyCity || quote.companyDepartment) && (
                <p className="mt-1 text-sm text-slate-300">
                  {[quote.companyCity, quote.companyDepartment].filter(Boolean).join(", ")}
                </p>
              )}
              {quote.companyWebsite && (
                <p className="mt-1 text-xs text-slate-400">{quote.companyWebsite}</p>
              )}
            </div>
            {quote.companyLogoUrl ? (
              <img src={quote.companyLogoUrl} alt="Logo empresa" className="h-12 max-w-[160px] object-contain brightness-0 invert" />
            ) : (
              <div className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white">
                {quote.companyName?.slice(0, 5).toUpperCase() || "COTIX"}
              </div>
            )}
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
              <p className="mt-2 text-3xl font-bold">{formatCurrency(totals.total, quote.currency)}</p>
              <p className="mt-2 text-xs">{totals.tax > 0 ? (quote.pricesIncludeTax ? "Impuesto incluido" : "Incluye impuesto") : ""}</p>
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
                    <div><span className="label">Precio</span><p>{formatCurrency(item.unitPrice, quote.currency)}</p></div>
                    <div><span className="label">Total</span><p className="font-bold">{formatCurrency(item.lineTotal ?? item.quantity * item.unitPrice * (1 - item.discountRate), quote.currency)}</p></div>
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
                      <td className="py-4 text-right">{formatCurrency(item.unitPrice, quote.currency)}</td>
                      <td className="py-4 text-right font-bold">{formatCurrency(item.lineTotal ?? item.quantity * item.unitPrice * (1 - item.discountRate), quote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto mt-6 max-w-sm space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(totals.subtotal, quote.currency)}</strong></div>
              <div className="flex justify-between"><span>Descuentos</span><strong>-{formatCurrency(totals.discount, quote.currency)}</strong></div>
              <div className="flex justify-between"><span>Impuestos</span><strong>{formatCurrency(totals.tax, quote.currency)}</strong></div>
              <div className="flex justify-between border-t border-border pt-3 text-xl"><span>Total</span><strong>{formatCurrency(totals.total, quote.currency)}</strong></div>
            </div>
          </section>

          {(quote.notes || quote.termsConditions) && (
            <section className="rounded-lg border border-border bg-slate-50 p-5">
              <p className="font-semibold">Notas y terminos</p>
              {quote.notes && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{quote.notes}</p>
              )}
              {quote.termsConditions && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{quote.termsConditions}</p>
              )}
            </section>
          )}

          <section className="mt-6 rounded-lg border border-border bg-white p-5 text-center">
            {canRespond ? (
              <>
                <h2 className="text-lg font-bold">¿Esta cotización es de tu interés?</h2>
                <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button variant="success" disabled={respondMutation.isPending} onClick={() => setResponseMode("sign")}><Check className="h-4 w-4" />Firmar y aceptar</Button>
                  <Button variant="secondary" disabled={respondMutation.isPending} onClick={() => setResponseMode("changes")}><MessageSquare className="h-4 w-4" />Solicitar cambios</Button>
                  <Button variant="danger" loading={respondMutation.isPending} onClick={rejectQuote}><X className="h-4 w-4" />Rechazar</Button>
                  <Button variant="secondary" loading={pdfMutation.isPending} onClick={() => pdfMutation.mutate()}><Download className="h-4 w-4" />Descargar PDF</Button>
                </div>
                {responseMode === "sign" && (
                  <form className="mx-auto mt-6 max-w-xl space-y-4 rounded-lg border border-border bg-slate-50 p-5 text-left" onSubmit={(event) => { event.preventDefault(); respondMutation.mutate("accept") }}>
                    <h3 className="font-semibold">Firma electrónica de aceptación</h3>
                    <p className="text-sm text-muted-foreground">Revisa el importe y los términos antes de firmar. Esta aceptación quedará registrada con la versión exacta de la cotización.</p>
                    <label className="block text-sm font-medium">Nombre completo
                      <input className="field mt-1 w-full" autoComplete="name" minLength={2} maxLength={120} required value={signerName} onChange={(event) => setSignerName(event.target.value)} />
                    </label>
                    <div><p className="mb-1 text-sm font-medium">Dibuja tu firma</p><SignaturePad value={signatureStrokes} onChange={setSignatureStrokes} /></div>
                    <label className="flex gap-2 text-sm"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required disabled={!quote.consentText} /><span>{quote.consentText || "El consentimiento no está disponible. Inténtalo de nuevo más tarde."}</span></label>
                    <div className="flex gap-2"><Button type="submit" variant="success" loading={respondMutation.isPending} disabled={!quote.consentText || !consent || signerName.trim().length < 2 || signatureStrokes.flat().length < 8}>Confirmar aceptación</Button><Button type="button" variant="secondary" onClick={() => setResponseMode(null)}>Cancelar</Button></div>
                  </form>
                )}
                {responseMode === "changes" && (
                  <form className="mx-auto mt-6 max-w-xl space-y-4 rounded-lg border border-border bg-slate-50 p-5 text-left" onSubmit={(event) => { event.preventDefault(); respondMutation.mutate("changes") }}>
                    <h3 className="font-semibold">Solicitar cambios</h3>
                    <p className="text-sm text-muted-foreground">Explica qué deseas ajustar. El equipo comercial recibirá tu mensaje y podrá enviarte una nueva versión.</p>
                    <textarea className="field w-full" rows={4} minLength={10} maxLength={2000} required value={changeMessage} onChange={(event) => setChangeMessage(event.target.value)} />
                    <div className="flex gap-2"><Button type="submit" loading={respondMutation.isPending} disabled={changeMessage.trim().length < 10}>Enviar solicitud</Button><Button type="button" variant="secondary" onClick={() => setResponseMode(null)}>Cancelar</Button></div>
                  </form>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">{quote.status === "accepted" ? "Gracias. Has firmado y aceptado esta cotización." : quote.status === "changes_requested" ? "Tu solicitud de cambios fue enviada." : "Respuesta registrada"}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {quote.status === "accepted"
                    ? "El equipo comercial se pondra en contacto contigo pronto."
                    : quote.status === "changes_requested" ? "El equipo comercial revisará tu solicitud y podrá enviarte una nueva cotización." : "Esta cotización ya no requiere una acción adicional."}
                </p>
                {quote.status === "accepted" && quote.acceptance && <p className="mt-3 text-sm text-muted-foreground">Firma registrada a nombre de <strong>{quote.acceptance.signerName}</strong> el {new Date(quote.acceptance.signedAt).toLocaleString("es-GT")}.</p>}
                {quote.status === "changes_requested" && quote.changeRequestMessage && <p className="mx-auto mt-3 max-w-xl whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-left text-sm">{quote.changeRequestMessage}</p>}
                <Button className="mt-5" variant="secondary" loading={pdfMutation.isPending} onClick={() => pdfMutation.mutate()}><Download className="h-4 w-4" />Descargar PDF</Button>
              </>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
