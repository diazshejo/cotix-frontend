import { Link, useSearchParams } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { resetPassword } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { InputField } from "@/components/ui/Form"
import { routes } from "@/constants/routes"
import { resetPasswordSchema, type ResetPasswordForm } from "@/utils/validators"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordForm) => {
      if (!token) throw new Error("Token no encontrado.")
      return resetPassword(token, values.password, values.confirmPassword)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Enlace inválido</h1>
            <p className="mt-3 text-sm text-muted-foreground">El enlace de recuperación no contiene un token válido.</p>
            <Link to={routes.forgotPassword} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition border border-border bg-white text-foreground hover:bg-muted mt-6">Solicitar nuevo enlace</Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (mutation.isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-bold">Password actualizado</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Tu password fue restablecido exitosamente. Ahora puedes ingresar con tu nueva contraseña.
            </p>
            <Link to={routes.login} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition bg-primary text-primary-foreground hover:bg-primary/92 shadow-sm mt-6">Ir al inicio de sesión</Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-7">
          <p className="label">Seguridad</p>
          <h1 className="mt-2 text-2xl font-bold">Nuevo password</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Elige un password seguro. Mínimo 8 caracteres.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            <InputField
              label="Nuevo password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register("password")}
            />
            <InputField
              label="Confirmar password"
              type="password"
              placeholder="Repite el password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button className="w-full" loading={mutation.isPending}>
              Establecer nuevo password
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
