import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ImagePlus, Save } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { getCompanySettings, updateCompanySettings } from "@/api/settings"
import { ErrorState, LoadingState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { InputField, SelectField, TextareaField } from "@/components/ui/Form"
import { queryKeys } from "@/constants/queryKeys"
import { useAuthStore } from "@/stores/authStore"
import { canPerform } from "@/utils/permissions"
import { companySettingsSchema, type CompanySettingsForm } from "@/utils/validators"

export default function CompanySettingsPage() {
  const queryClient = useQueryClient()
  const role = useAuthStore((state) => state.user?.role)
  const canManageSettings = canPerform(role, "manageSettings")
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.companySettings,
    queryFn: getCompanySettings,
  })
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CompanySettingsForm>({
    resolver: zodResolver(companySettingsSchema),
  })
  const brandColor = watch("brandColor")
  const mutation = useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: async () => {
      toast.success("Configuracion guardada.")
      await queryClient.invalidateQueries({ queryKey: queryKeys.companySettings })
    },
    onError: () => toast.error("No se pudo guardar la configuracion."),
  })

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  if (isLoading) return <LoadingState title="Cargando configuracion" />
  if (isError || !data) {
    return <ErrorState title="No se pudo cargar settings" description="La API no respondio correctamente." onAction={() => void refetch()} />
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Settings</p>
        <h2 className="mt-2 text-2xl font-bold">Configuracion de empresa</h2>
        <p className="mt-2 text-sm text-muted-foreground">Marca, datos fiscales y defaults de cotizacion.</p>
      </div>

      <form className="grid gap-6 xl:grid-cols-[360px_1fr]" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <Card>
          <CardHeader>
            <p className="label">Identidad</p>
            <h3 className="mt-1 text-lg font-bold">Logo y color</h3>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white text-center">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">Subir logo</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG o JPG, maximo 5MB</p>
            </div>
            <label className="mt-5 block">
              <span className="label">Color de marca</span>
              <div className="mt-2 flex gap-3">
                <input className="h-11 w-16 rounded-md border border-border p-1" type="color" {...register("brandColor")} />
                <input className="field" style={{ borderColor: brandColor }} {...register("brandColor")} />
              </div>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="label">Datos del negocio</p>
            <h3 className="mt-1 text-lg font-bold">Informacion fiscal y comercial</h3>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Nombre legal" error={errors.businessName?.message} {...register("businessName")} />
              <InputField label="Nombre comercial" error={errors.tradeName?.message} {...register("tradeName")} />
              <InputField label="NIT" error={errors.nit?.message} {...register("nit")} />
              <InputField label="Regimen fiscal" error={errors.taxRegime?.message} {...register("taxRegime")} />
              <InputField label="Email" error={errors.email?.message} {...register("email")} />
              <InputField label="Telefono" error={errors.phone?.message} {...register("phone")} />
              <InputField label="Sitio web" error={errors.website?.message} {...register("website")} />
              <InputField label="Direccion" error={errors.addressLine1?.message} {...register("addressLine1")} />
              <InputField label="Ciudad" error={errors.city?.message} {...register("city")} />
              <InputField label="Departamento" error={errors.department?.message} {...register("department")} />
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              <SelectField label="Moneda" error={errors.defaultCurrency?.message} {...register("defaultCurrency")}>
                <option value="GTQ">GTQ</option>
                <option value="USD">USD</option>
              </SelectField>
              <InputField label="Impuesto" error={errors.taxLabel?.message} {...register("taxLabel")} />
              <InputField label="Tasa %" type="number" step="0.01" error={errors.taxRate?.message} {...register("taxRate")} />
              <InputField label="Prefijo" error={errors.quotePrefix?.message} {...register("quotePrefix")} />
              <InputField label="Digitos" type="number" error={errors.quoteDigits?.message} {...register("quoteDigits")} />
            </div>
            <TextareaField label="Pie de pagina" error={errors.footerText?.message} {...register("footerText")} />
            <TextareaField label="Terminos por defecto" error={errors.defaultTerms?.message} {...register("defaultTerms")} />
            <Button disabled={!canManageSettings} loading={mutation.isPending} title={!canManageSettings ? "Tu rol no permite modificar settings" : undefined}><Save className="h-4 w-4" />Guardar cambios</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
