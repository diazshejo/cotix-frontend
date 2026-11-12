import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Download, PieChart } from "lucide-react"
import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from "recharts"
import { getDashboardMetrics } from "@/api/dashboard"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { queryKeys } from "@/constants/queryKeys"
import { formatCurrency } from "@/utils/currency"

export default function ReportsPage() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month")
  const [currency, setCurrency] = useState<"GTQ" | "USD">("GTQ")
  const { data: metrics, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.dashboard(`${period}-${currency}`),
    queryFn: () => getDashboardMetrics(period, currency),
  })

  if (isLoading) return <LoadingState title="Cargando reportes" />
  if (isError || !metrics) {
    return <ErrorState title="No se pudieron cargar reportes" description="La API no respondio correctamente." onAction={() => void refetch()} />
  }

  const reportMetrics = metrics
  const data = [
    { name: "Aceptadas", value: reportMetrics.quotesAccepted, color: "#10b981" },
    { name: "Enviadas", value: reportMetrics.quotesSent, color: "#2563eb" },
    { name: "Rechazadas", value: reportMetrics.quotesRejected, color: "#e11d48" },
    { name: "Creadas", value: reportMetrics.quotesCreated, color: "#0891b2" },
  ]

  function exportCsv() {
    const rows = [
      ["Metrica", "Valor"],
      ["Moneda", currency],
      ["Periodo", period],
      ["Total cotizado", reportMetrics.totalQuoted],
      ["Total aceptado", reportMetrics.totalAccepted],
      ["Conversion", reportMetrics.conversionRate],
      ["Cotizaciones creadas", reportMetrics.quotesCreated],
      ["Cotizaciones enviadas", reportMetrics.quotesSent],
      ["Cotizaciones aceptadas", reportMetrics.quotesAccepted],
      ["Cotizaciones rechazadas", reportMetrics.quotesRejected],
    ]
    const csv = rows.map((row) => row.join(",")).join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const link = document.createElement("a")
    link.href = url
    link.download = "cotix-reportes.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label">Analitica</p>
          <h2 className="mt-2 text-2xl font-bold">Reportes</h2>
          <p className="mt-2 text-sm text-muted-foreground">Vision comercial para entender conversion, volumen y valor cotizado.</p>
        </div>
        <div className="flex gap-2">
          <select className="field" value={period} onChange={(event) => setPeriod(event.target.value as typeof period)} aria-label="Periodo del reporte">
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
          <select className="field" value={currency} onChange={(event) => setCurrency(event.target.value as "GTQ" | "USD")} aria-label="Moneda del reporte">
            <option value="GTQ">GTQ</option>
            <option value="USD">USD</option>
          </select>
          <Button variant="secondary" onClick={exportCsv}><Download className="h-4 w-4" />Exportar CSV</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <p className="label">Estados</p>
            <h3 className="mt-1 text-lg font-bold">Distribución del periodo</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={data} dataKey="value" innerRadius={70} outerRadius={110} paddingAngle={4}>
                    {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <p className="label">Top items</p>
            <h3 className="mt-1 text-lg font-bold">Mas cotizados</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topItems.map((item, index) => (
              <div key={item.itemName} className="flex items-center gap-4 rounded-lg border border-border bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <PieChart className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{item.itemName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(item.totalAmount, currency)} cotizados</p>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${82 - index * 18}%` }} />
                  </div>
                </div>
                <strong>{item.timesQuoted}</strong>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
