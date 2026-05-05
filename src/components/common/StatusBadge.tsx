import { QuoteStatus } from "@/types/quote"
import { cn } from "@/utils/cn"

const label: Record<QuoteStatus, string> = {
  draft: "Borrador",
  sent: "Enviada",
  viewed: "Vista",
  accepted: "Aceptada",
  rejected: "Rechazada",
  expired: "Vencida",
}

const tone: Record<QuoteStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-cyan-100 text-cyan-800",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  expired: "bg-amber-100 text-amber-800",
}

export function StatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tone[status])}>
      {label[status]}
    </span>
  )
}
