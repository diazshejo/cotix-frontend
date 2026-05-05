import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Boxes, Plus, Search, Upload } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { createCatalogItem, listCatalogItems } from "@/api/catalog"
import { EmptyState } from "@/components/common/EmptyState"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { InputField, SelectField, TextareaField } from "@/components/ui/Form"
import { Modal } from "@/components/ui/Modal"
import { queryKeys } from "@/constants/queryKeys"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuthStore } from "@/stores/authStore"
import { formatCurrency } from "@/utils/currency"
import { canPerform } from "@/utils/permissions"
import { catalogItemSchema, type CatalogItemForm } from "@/utils/validators"

export default function CatalogItemsPage() {
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const role = useAuthStore((state) => state.user?.role)
  const canManageCatalog = canPerform(role, "manageCatalog")
  const debouncedSearch = useDebounce(search)
  const queryClient = useQueryClient()
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.catalogItems(debouncedSearch),
    queryFn: () => listCatalogItems(debouncedSearch),
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CatalogItemForm>({
    resolver: zodResolver(catalogItemSchema),
    defaultValues: { name: "", description: "", category: "Servicios", unitPrice: 0, taxRate: 12, active: true },
  })
  const mutation = useMutation({
    mutationFn: (values: CatalogItemForm) => createCatalogItem({ ...values, taxRate: values.taxRate / 100 }),
    onSuccess: async () => {
      toast.success("Item creado.")
      reset()
      setModalOpen(false)
      await queryClient.invalidateQueries({ queryKey: queryKeys.catalogItems(debouncedSearch) })
    },
    onError: () => toast.error("No se pudo crear el item."),
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="label">Catalogo</p>
          <h2 className="mt-2 text-2xl font-bold">Productos y servicios</h2>
          <p className="mt-2 text-sm text-muted-foreground">Base reutilizable para construir cotizaciones sin capturar desde cero.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={!canManageCatalog} title={!canManageCatalog ? "Tu rol no permite importar catalogo" : undefined}><Upload className="h-4 w-4" />Importar CSV</Button>
          <Button disabled={!canManageCatalog} onClick={() => setModalOpen(true)} title={!canManageCatalog ? "Tu rol no permite crear items" : undefined}><Plus className="h-4 w-4" />Nuevo item</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-white px-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input className="w-full border-0 bg-transparent text-sm outline-none" placeholder="Buscar item" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <select className="field"><option>Todas las categorias</option></select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <LoadingState title="Cargando catalogo" /> : null}
          {isError ? <ErrorState title="No se pudo cargar el catalogo" description="La API no respondio correctamente." onAction={() => void refetch()} /> : null}
          {!isLoading && !isError && data.length === 0 ? (
            <EmptyState icon={Boxes} title="Catalogo vacio" description="Agrega productos o servicios cuando tu rol tenga permiso. El constructor los usara como base reutilizable." />
          ) : null}
          {!isLoading && !isError && data.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.map((item) => (
            <article key={item.id} className="rounded-lg border border-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Boxes className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{item.active ? "Activo" : "Inactivo"}</span>
              </div>
              <h3 className="mt-4 font-bold">{item.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.category}</p>
              <p className="mt-4 text-xl font-bold">{formatCurrency(item.unitPrice)}</p>
            </article>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal open={modalOpen} title="Nuevo producto o servicio" description="Este item estara disponible en el constructor." onClose={() => setModalOpen(false)}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <InputField label="Nombre" error={errors.name?.message} {...register("name")} />
          <InputField label="Categoria" error={errors.category?.message} {...register("category")} />
          <InputField label="Precio unitario" type="number" step="0.01" error={errors.unitPrice?.message} {...register("unitPrice")} />
          <InputField label="Impuesto %" type="number" step="0.01" error={errors.taxRate?.message} {...register("taxRate")} />
          <SelectField label="Estado" {...register("active", { setValueAs: (value) => value === "true" })}>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </SelectField>
          <TextareaField label="Descripcion" className="sm:col-span-2" error={errors.description?.message} {...register("description")} />
          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={mutation.isPending}>Guardar item</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
