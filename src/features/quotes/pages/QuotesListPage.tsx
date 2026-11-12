import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Filter, Plus, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { listQuotes } from "@/api/quotes"
import { EmptyState } from "@/components/common/EmptyState"
import { MobileFab } from "@/components/common/MobileFab"
import { PageSkeleton } from "@/components/common/Skeleton"
import { ErrorState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { StatusBadge } from "@/components/common/StatusBadge"
import { queryKeys } from "@/constants/queryKeys"
import { routes } from "@/constants/routes"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuthStore } from "@/stores/authStore"
import { formatCurrency } from "@/utils/currency"
import { canPerform } from "@/utils/permissions"

export default function QuotesListPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const role = useAuthStore((state) => state.user?.role)
  const canCreate = canPerform(role, "create")
  const debouncedSearch = useDebounce(search)
  const filters = useMemo(() => ({ search: debouncedSearch, status, page }), [debouncedSearch, status, page])
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.quotes(filters),
    queryFn: () => listQuotes(filters),
  })

  const filteredQuotes = data?.results ?? []

  return (
    <div className="space-y-5 pb-20 sm:pb-0">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label">Pipeline comercial</p>
          <h2 className="mt-2 text-2xl font-bold">Cotizaciones</h2>
          <p className="mt-2 text-sm text-muted-foreground">Busca, filtra y da seguimiento al estado de cada propuesta.</p>
        </div>
        {canCreate ? (
          <Link className="hidden sm:block" to={routes.newQuote}>
            <Button>
              <Plus className="h-4 w-4" />
              Nueva cotizacion
            </Button>
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-11 flex-1 items-center gap-2 rounded-md border border-input bg-white px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="w-full border-0 bg-transparent text-sm outline-none"
                placeholder="Buscar por cliente, numero o email"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              />
            </div>
            <select className="field md:w-48" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="sent">Enviada</option>
              <option value="viewed">Vista</option>
              <option value="accepted">Aceptada</option>
              <option value="rejected">Rechazada</option>
              <option value="changes_requested">Cambios solicitados</option>
            </select>
            <Button variant="secondary" onClick={() => { setSearch(""); setStatus(""); setPage(1) }}>
              <Filter className="h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="p-5"><PageSkeleton variant="list" /></div> : null}
          {isError ? (
            <div className="p-5">
              <ErrorState title="No se pudieron cargar las cotizaciones" description="Intenta nuevamente o revisa la conexion con la API." onAction={() => void refetch()} />
            </div>
          ) : null}
          {!isLoading && !isError && filteredQuotes.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Search}
                title={search || status ? "Sin resultados" : "Aun no tienes cotizaciones"}
                description={search || status ? "Ajusta la busqueda o limpia los filtros para ver mas resultados." : "Crea tu primera cotizacion para iniciar el seguimiento comercial."}
                action={!search && !status && canCreate ? "Crear cotizacion" : undefined}
                onAction={!search && !status && canCreate ? () => { window.location.href = routes.newQuote } : undefined}
              />
            </div>
          ) : null}
          {!isLoading && !isError && filteredQuotes.length > 0 ? (
            <>
            <div className="grid gap-3 p-4 md:hidden">
              {filteredQuotes.map((quote) => (
                <Link key={quote.id} to={routes.quoteDetail(quote.id)} className="rounded-lg border border-border bg-white p-4 transition hover:border-primary">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{quote.number}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{quote.clientName}</p>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                    <span className="text-muted-foreground">Valida hasta {quote.validUntil}</span>
                    <strong>{formatCurrency(quote.total, quote.currency)}</strong>
                  </div>
                </Link>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Numero</th>
                    <th className="px-5 py-3 font-semibold">Cliente</th>
                    <th className="px-5 py-3 font-semibold">Valida hasta</th>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote.id} className="bg-white/70 transition hover:bg-accent/35">
                      <td className="px-5 py-4 font-semibold">
                        <Link className="text-primary hover:underline" to={routes.quoteDetail(quote.id)}>{quote.number}</Link>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{quote.clientName}</p>
                        <p className="text-xs text-muted-foreground">{quote.clientEmail}</p>
                      </td>
                      <td className="px-5 py-4">{quote.validUntil}</td>
                      <td className="px-5 py-4"><StatusBadge status={quote.status} /></td>
                      <td className="px-5 py-4 text-right font-bold">{formatCurrency(quote.total, quote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          ) : null}
        </CardContent>
      </Card>
      {!isLoading && !isError && data && (data.previous || data.next) ? (
        <nav className="flex items-center justify-between gap-3" aria-label="Páginas de cotizaciones">
          <p className="text-sm text-muted-foreground">Página {page} · {data.count} cotizaciones</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={!data.previous} onClick={() => setPage((value) => value - 1)}>Anterior</Button>
            <Button variant="secondary" disabled={!data.next} onClick={() => setPage((value) => value + 1)}>Siguiente</Button>
          </div>
        </nav>
      ) : null}
      {canCreate ? <MobileFab icon={Plus} label="Nueva" to={routes.newQuote} /> : null}
    </div>
  )
}
