import { Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { requestPasswordReset } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { routes } from "@/constants/routes"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => toast.success("Instrucciones enviadas."),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-7">
          <Link to={routes.login} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <p className="label">Recuperacion</p>
          <h1 className="mt-2 text-2xl font-bold">Restablecer password</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enviaremos instrucciones al email asociado al workspace.
          </p>
          <input className="field mt-6" placeholder="tu@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Button className="mt-4 w-full" loading={mutation.isPending} onClick={() => mutation.mutate(email)}>
            Enviar instrucciones
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
