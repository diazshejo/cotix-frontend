import { Link, useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { register as registerUser } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { InputField } from "@/components/ui/Form"
import { routes } from "@/constants/routes"
import { useAuthStore } from "@/stores/authStore"
import { publishSessionEvent } from "@/utils/sessionSync"
import { registerSchema, type RegisterForm } from "@/utils/validators"

export default function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { businessName: "", nit: "", email: "", password: "", confirmPassword: "" },
  })
  const mutation = useMutation({
    mutationFn: (values: RegisterForm) =>
      registerUser({
        business_name: values.businessName,
        nit: values.nit ?? "",
        email: values.email,
        password: values.password,
      }),
    onSuccess: (session) => {
      setSession(session.access, session.user)
      publishSessionEvent("login")
      toast.success("Workspace creado.")
      navigate(routes.dashboard, { replace: true })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl">
        <CardContent className="p-7">
          <Link to={routes.login} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <p className="label">Onboarding</p>
          <h1 className="mt-2 text-2xl font-bold">Configura tu empresa</h1>
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InputField label="Empresa" placeholder="Nombre de empresa" error={errors.businessName?.message} {...register("businessName")} />
              <InputField label="NIT" placeholder="NIT" error={errors.nit?.message} {...register("nit")} />
              <InputField label="Email laboral" className="sm:col-span-2" placeholder="Email laboral" error={errors.email?.message} {...register("email")} />
              <InputField label="Password" type="password" placeholder="Minimo 8 caracteres" error={errors.password?.message} {...register("password")} />
              <InputField label="Confirmar password" type="password" placeholder="Repite el password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
            </div>
            <Button className="mt-6 w-full" loading={mutation.isPending}>Crear workspace</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
