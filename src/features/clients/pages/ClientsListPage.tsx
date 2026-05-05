import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Users } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createClient, listClients } from "@/api/clients"
import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { InputField, SelectField } from "@/components/ui/Form"
import { Modal } from "@/components/ui/Modal"
import { queryKeys } from "@/constants/queryKeys"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuthStore } from "@/stores/authStore"
import { formatCurrency } from "@/utils/currency"
import { canPerform } from "@/utils/permissions"
import { clientSchema, type ClientForm } from "@/utils/validators"

export default function ClientsListPage() {
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const role = useAuthStore((state) => state.user?.role)
  const tenantId = useAuthStore((state) => state.user?.tenantId)
  const canManageClients = canPerform(role, "manageClients") && Boolean(tenantId)
  const debouncedSearch = useDebounce(search)
  const queryClient = useQueryClient()
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.clients(debouncedSearch),
    queryFn: () => listClients(debouncedSearch),
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: "", email: "", phone: "", nit: "", companyType: "company" },
  })
  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: async () => {
      toast.success("Cliente creado.")
      reset()
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients(debouncedSearch) })
    },
    onError: () => toast.error("No se pudo crear el cliente."),
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label">CRM ligero</p>
          <h2 className="mt-2 text-2xl font-bold">Clientes</h2>
          <p className="mt-2 text-sm text-muted-foreground">Historial comercial y datos de contacto centralizados.</p>
        </div>
        <Button disabled={!canManageClients} onClick={() => setModalOpen(true)} title={!canManageClients ? "Necesitas un workspace activo para crear clientes" : undefined}><Plus className="h-4 w-4" />Nuevo cliente</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex h-11 max-w-md items-center gap-2 rounded-md border border-input bg-white px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input className="w-full border-0 bg-transparent text-sm outline-none" placeholder="Buscar cliente o email" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingState title="Cargando clientes" /> : null}
          {isError ? <ErrorState title="No se pudieron cargar clientes" description="La API no respondio correctamente." onAction={() => void refetch()} /> : null}
          {!isLoading && !isError && data.length === 0 ? (
            <EmptyState icon={Users} title="No hay clientes todavia" description="Crea clientes desde el boton superior cuando tu rol tenga permiso. Asi podras reutilizar contactos en nuevas cotizaciones." />
          ) : null}
          {!isLoading && !isError && data.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.map((client) => (
                <article key={client.id} className="rounded-lg border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-panel">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-bold">{client.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{client.email}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">{client.quotesCount} cotizaciones</span>
                  <strong>{formatCurrency(client.totalQuoted)}</strong>
                </div>
              </article>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal open={modalOpen} title="Nuevo cliente" description="Datos minimos para cotizar y dar seguimiento." onClose={() => setModalOpen(false)}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <InputField label="Nombre" error={errors.name?.message} {...register("name")} />
          <InputField label="Email" error={errors.email?.message} {...register("email")} />
          <InputField label="Telefono" error={errors.phone?.message} {...register("phone")} />
          <InputField label="NIT" error={errors.nit?.message} {...register("nit")} />
          <SelectField label="Tipo" error={errors.companyType?.message} {...register("companyType")}>
            <option value="company">Empresa</option>
            <option value="person">Persona</option>
          </SelectField>
          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={mutation.isPending}>Guardar cliente</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
