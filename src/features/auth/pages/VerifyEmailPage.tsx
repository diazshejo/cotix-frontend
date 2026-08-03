import { Link, useSearchParams } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { useEffect } from "react"
import { verifyEmail } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { routes } from "@/constants/routes"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const mutation = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Token no encontrado en el enlace.")
      return verifyEmail(token)
    },
  })

  // Automatically call the API when the page loads with a token
  useEffect(() => {
    if (token && mutation.isIdle) {
      mutation.mutate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {mutation.isPending && (
            <>
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
              <h1 className="text-2xl font-bold">Verificando tu correo…</h1>
              <p className="mt-3 text-sm text-muted-foreground">Un momento, por favor.</p>
            </>
          )}

          {mutation.isSuccess && (
            <>
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h1 className="text-2xl font-bold">¡Correo verificado!</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Tu cuenta está activa. Ya puedes ingresar a tu workspace.
              </p>
              <Button asChild className="mt-6">
                <Link to={routes.login}>Ir al inicio de sesión</Link>
              </Button>
            </>
          )}

          {mutation.isError && (
            <>
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h1 className="text-2xl font-bold">Enlace no válido</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {getApiErrorMessage(mutation.error) ||
                  "El enlace de verificación expiró o ya fue utilizado. Solicita uno nuevo."}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Button asChild variant="outline">
                  <Link to={routes.login}>Iniciar sesión</Link>
                </Button>
              </div>
            </>
          )}

          {!token && !mutation.isPending && (
            <>
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h1 className="text-2xl font-bold">Enlace inválido</h1>
              <p className="mt-3 text-sm text-muted-foreground">El enlace de verificación no contiene un token.</p>
              <Button asChild className="mt-6" variant="outline">
                <Link to={routes.login}>Ir al inicio de sesión</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
