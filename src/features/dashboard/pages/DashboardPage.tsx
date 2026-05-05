import { useQuery } from "@tanstack/react-query"
import { ArrowUpRight, Clock, FileText, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getDashboardMetrics } from "@/api/dashboard"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { queryKeys } from "@/constants/queryKeys"
import { formatCurrency } from "@/utils/currency"

export default function DashboardPage() {
  const period = "month"
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.dashboard(period),
    queryFn: () => getDashboardMetrics(period),
  })

  if (isLoading) return <LoadingState title="Cargando dashboard" />
  if (isError || !data) {
    return (
      <ErrorState
        title="No se pudo cargar el dashboard"
        description="Revisa la conexion con el backend o intenta nuevamente."
        onAction={() => void refetch()}
      />
    )
  }

  const metrics = [
    { label: "Monto cotizado", value: formatCurrency(data.totalQuoted), helper: `${data.quotesCreated} cotizaciones creadas`, icon: FileText },
    { label: "Monto aceptado", value: formatCurrency(data.totalAccepted), helper: `${data.quotesAccepted} aceptadas`, icon: TrendingUp },
    { label: "Conversion", value: `${data.conversionRate}%`, helper: `${data.quotesSent} enviadas`, icon: ArrowUpRight },
    { label: "Vencen pronto", value: String(data.expiringQuotes.length), helper: "requieren seguimiento", icon: Clock },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label">{metric.label}</p>
                  <p className="mt-3 text-2xl font-bold">{metric.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{metric.helper}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="label">Rendimiento</p>
                <h2 className="mt-1 text-lg font-bold">Conversion de cotizaciones</h2>
              </div>
              <select className="field w-40">
                <option>Este mes</option>
                <option>Este año</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.conversionSeries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe5ec" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(15, 23, 42, .04)" }} />
                  <Bar dataKey="sent" name="Enviadas" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="accepted" name="Aceptadas" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey="rate" name="Conversion" stroke="#0891b2" strokeWidth={3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="label">Actividad reciente</p>
            <h2 className="mt-1 text-lg font-bold">Ultimas cotizaciones</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentQuotes.map((quote) => (
              <div key={quote.id} className="rounded-md border border-border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{quote.number}</p>
                  <StatusBadge status={quote.status} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{quote.clientName}</p>
                <p className="mt-3 text-lg font-bold">{formatCurrency(quote.total, quote.currency)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
