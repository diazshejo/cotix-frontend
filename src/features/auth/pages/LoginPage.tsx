import { Link, useLocation, useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Building2, Eye, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { login } from "@/api/auth"
import { getApiErrorMessage } from "@/api/client"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { FieldError } from "@/components/ui/Form"
import { routes } from "@/constants/routes"
import { useAuthStore } from "@/stores/authStore"
import { publishSessionEvent } from "@/utils/sessionSync"
import { loginSchema, type LoginForm } from "@/utils/validators"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((state) => state.setSession)
  const from = (location.state as { from?: string } | null)?.from ?? routes.dashboard
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session.access, session.user)
      publishSessionEvent("login")
      toast.success("Sesion iniciada.")
      navigate(from, { replace: true })
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden p-10 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,.28),transparent_34rem),linear-gradient(145deg,#020617,#0f172a_55%,#164e63)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300 text-slate-950">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">Cotix</p>
              <p className="text-sm text-slate-300">Cotizaciones que avanzan ventas</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="label text-cyan-200">SaaS comercial</p>
            <h1 className="mt-4 text-5xl font-bold leading-tight">
              Crea, envia y da seguimiento a cotizaciones en minutos.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              Un workspace serio para equipos que necesitan velocidad, control de marca y seguimiento claro de cada propuesta.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Preview en vivo", "Portal publico", "JWT seguro"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-7">
            <div className="mb-7">
              <p className="label">Bienvenido</p>
              <h2 className="mt-2 text-2xl font-bold">Ingresar a Cotix</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Accede al panel interno para gestionar cotizaciones, clientes y catalogo.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              <label className="block">
                <span className="label">Email</span>
                <div className="mt-2 flex items-center gap-2 rounded-md border border-input bg-white px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <input className="h-11 w-full border-0 bg-transparent text-sm outline-none" placeholder="ventas@empresa.gt" {...register("email")} />
                </div>
                <FieldError message={errors.email?.message} />
              </label>
              <label className="block">
                <span className="label">Password</span>
                <div className="mt-2 flex items-center gap-2 rounded-md border border-input bg-white px-3 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <input className="h-11 w-full border-0 bg-transparent text-sm outline-none" type="password" placeholder="Password" {...register("password")} />
                </div>
                <FieldError message={errors.password?.message} />
              </label>
              <Button className="w-full" loading={mutation.isPending}>Ingresar</Button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link className="font-semibold text-primary" to={routes.forgotPassword}>
                Recuperar password
              </Link>
              <Link className="font-semibold text-primary" to={routes.register}>
                Crear cuenta
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
