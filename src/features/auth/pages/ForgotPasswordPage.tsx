import { Link } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { requestPasswordReset } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { InputField } from "@/components/ui/Form"
import { routes } from "@/constants/routes"
import { forgotPasswordSchema, type ForgotPasswordForm } from "@/utils/validators"

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordForm) => requestPasswordReset(values.email),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  if (mutation.isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-bold">Revisa tu correo</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Si el email está registrado, recibirás las instrucciones para restablecer tu password en los próximos
              minutos.
            </p>
            <Link to={routes.login} className="mt-6 inline-block text-sm font-semibold text-primary">
              Volver al inicio de sesión
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-7">
          <Link
            to={routes.login}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <p className="label">Recuperacion</p>
          <h1 className="mt-2 text-2xl font-bold">Restablecer password</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ingresa tu email y te enviaremos las instrucciones para restablecer tu password.
          </p>

          <form className="mt-6" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            <InputField
              label="Email"
              type="email"
              placeholder="tu@empresa.gt"
              error={errors.email?.message}
              {...register("email")}
            />
            <Button className="mt-4 w-full" loading={mutation.isPending}>
              Enviar instrucciones
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
