import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ImagePlus, Loader2, Save } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { getCompanySettings, updateCompanySettings, uploadLogo } from "@/api/settings"
import { PageSkeleton } from "@/components/common/Skeleton"
import { ErrorState } from "@/components/common/StateBlock"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { InputField, SelectField, TextareaField } from "@/components/ui/Form"
import { queryKeys } from "@/constants/queryKeys"
import { useAuthStore } from "@/stores/authStore"
import { cn } from "@/utils/cn"
import { canPerform } from "@/utils/permissions"
import { companySettingsSchema, type CompanySettingsForm } from "@/utils/validators"

type SettingsSection = "identity" | "fiscal" | "quote" | "footer"

const sectionTabs: { id: SettingsSection; label: string }[] = [
  { id: "identity", label: "Identidad" },
  { id: "fiscal", label: "Fiscal" },
  { id: "quote", label: "Cotizacion" },
  { id: "footer", label: "Footer" },
]

export default function CompanySettingsPage() {
  const queryClient = useQueryClient()
  const role = useAuthStore((state) => state.user?.role)
  const [activeSection, setActiveSection] = useState<SettingsSection>("identity")
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
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
    if (data) {
      reset(data)
      setLogoUrl(data.logoUrl ?? "")
    }
  }, [data, reset])

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const result = await uploadLogo(file)
      setLogoUrl(result.logo_url)
      toast.success("Logo actualizado.")
      await queryClient.invalidateQueries({ queryKey: queryKeys.companySettings })
    } catch {
      toast.error("No se pudo subir el logo.")
    } finally {
      setLogoUploading(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  if (isLoading) return <PageSkeleton variant="form" />
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

      <div className="grid grid-cols-2 gap-2 md:hidden">
        {sectionTabs.map((section) => (
          <button
            key={section.id}
            type="button"
            className={cn(
              "focus-ring min-h-11 rounded-md border px-3 py-2 text-sm font-semibold",
              activeSection === section.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-foreground",
            )}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <form className="grid gap-6 pb-24 md:pb-0 xl:grid-cols-[360px_1fr]" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <Card className={cn(activeSection !== "identity" && "hidden md:block")}>
          <CardHeader>
            <p className="label">Identidad</p>
            <h3 className="mt-1 text-lg font-bold">Logo y color</h3>
          </CardHeader>
          <CardContent>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              disabled={!canManageSettings || logoUploading}
              onChange={handleLogoChange}
            />
            <button
              type="button"
              disabled={!canManageSettings || logoUploading}
              className="focus-ring flex min-h-40 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white text-center transition hover:border-primary hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : logoUrl ? (
                <img src={logoUrl} alt="Logo empresa" className="max-h-28 max-w-full object-contain p-3" />
              ) : (
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
              )}
              <p className="mt-3 text-sm font-semibold">{logoUrl ? "Cambiar logo" : "Subir logo"}</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG o JPG, maximo 5MB</p>
            </button>
            <label className="mt-5 block">
              <span className="label">Color de marca</span>
              <div className="mt-2 flex gap-3">
                <input className="h-11 w-16 rounded-md border border-border p-1" type="color" {...register("brandColor")} />
                <input className="field" style={{ borderColor: brandColor }} {...register("brandColor")} />
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="space-y-6">
        <Card className={cn(activeSection !== "fiscal" && "hidden md:block")}>
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
          </CardContent>
        </Card>

        <Card className={cn(activeSection !== "quote" && "hidden md:block")}>
          <CardHeader>
            <p className="label">Cotizacion</p>
            <h3 className="mt-1 text-lg font-bold">Defaults comerciales</h3>
          </CardHeader>
          <CardContent className="space-y-5">
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
          </CardContent>
        </Card>

        <Card className={cn(activeSection !== "footer" && "hidden md:block")}>
          <CardHeader>
            <p className="label">Footer</p>
            <h3 className="mt-1 text-lg font-bold">Textos por defecto</h3>
          </CardHeader>
          <CardContent className="space-y-5">
            <TextareaField label="Pie de pagina" error={errors.footerText?.message} {...register("footerText")} />
            <TextareaField label="Terminos por defecto" error={errors.defaultTerms?.message} {...register("defaultTerms")} />
          </CardContent>
        </Card>
        <Button className="hidden w-fit md:inline-flex" disabled={!canManageSettings} loading={mutation.isPending} title={!canManageSettings ? "Tu rol no permite modificar settings" : undefined}><Save className="h-4 w-4" />Guardar cambios</Button>
        </div>

        <div className="mobile-sticky-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-4 pt-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
          <Button className="w-full" disabled={!canManageSettings} loading={mutation.isPending} title={!canManageSettings ? "Tu rol no permite modificar settings" : undefined}><Save className="h-4 w-4" />Guardar cambios</Button>
        </div>
      </form>
    </div>
  )
}
