import { Link } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle, Mail } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { register as registerUser, resendVerification } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { InputField } from "@/components/ui/Form"
import { routes } from "@/constants/routes"
import { registerSchema, type RegisterForm } from "@/utils/validators"

// -----------------------------------------------------------------------
// Pending verification screen shown after a successful registration
// -----------------------------------------------------------------------
function PendingVerification({ email }: { email: string }) {
  const resend = useMutation({
    mutationFn: () => resendVerification(email),
    onSuccess: () => toast.success("Correo reenviado."),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h1 className="text-2xl font-bold">Revisa tu correo</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enviamos un enlace de verificación a <strong>{email}</strong>. Haz clic en el enlace para activar tu
            workspace.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">¿No llegó el correo?</p>
          <Button variant="secondary" className="mt-2" loading={resend.isPending} onClick={() => resend.mutate()}>
            Reenviar verificación
          </Button>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link to={routes.login} className="font-semibold text-primary">
              Volver al inicio de sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

// -----------------------------------------------------------------------
// Registration form
// -----------------------------------------------------------------------
export default function RegisterPage() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: "",
      tradeName: "",
      nit: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: RegisterForm) =>
      registerUser({
        business_name: values.businessName,
        trade_name: values.tradeName || undefined,
        nit: values.nit || undefined,
        email: values.email,
        password: values.password,
        first_name: values.firstName || undefined,
        last_name: values.lastName || undefined,
      }),
    onSuccess: (result) => setPendingEmail(result.email),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  if (pendingEmail) {
    return <PendingVerification email={pendingEmail} />
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl">
        <CardContent className="p-7">
          <Link
            to={routes.login}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <p className="label">Onboarding</p>
          <h1 className="mt-2 text-2xl font-bold">Configura tu empresa</h1>

          <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Empresa */}
              <InputField
                label="Nombre de empresa *"
                placeholder="Empresa S.A."
                className="sm:col-span-2"
                error={errors.businessName?.message}
                {...register("businessName")}
              />
              <InputField
                label="Nombre comercial"
                placeholder="Nombre que aparece en cotizaciones"
                className="sm:col-span-2"
                error={errors.tradeName?.message}
                {...register("tradeName")}
              />
              <InputField
                label="NIT"
                placeholder="1234567-8 o CF"
                error={errors.nit?.message}
                {...register("nit")}
              />

              {/* Separador */}
              <div className="sm:col-span-2 border-t pt-4">
                <p className="label text-xs text-muted-foreground">Tu cuenta personal</p>
              </div>

              <InputField
                label="Nombre"
                placeholder="Juan"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <InputField
                label="Apellido"
                placeholder="Pérez"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
              <InputField
                label="Email laboral *"
                type="email"
                className="sm:col-span-2"
                placeholder="juan@empresa.gt"
                error={errors.email?.message}
                {...register("email")}
              />
              <InputField
                label="Password *"
                type="password"
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register("password")}
              />
              <InputField
                label="Confirmar password *"
                type="password"
                placeholder="Repite el password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>

            <Button className="mt-6 w-full" loading={mutation.isPending}>
              <Mail className="mr-2 h-4 w-4" />
              Crear workspace
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
