import { useMutation } from "@tanstack/react-query"
import { CheckCircle2, CreditCard, ExternalLink, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { getMe } from "@/api/auth"
import { createCheckoutSession, createPortalSession, type BillingInterval } from "@/api/billing"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { routes } from "@/constants/routes"
import { useAuthStore } from "@/stores/authStore"
import type { TenantPlan } from "@/types/user"
import { cn } from "@/utils/cn"

const PLAN_LABEL: Record<TenantPlan, string> = {
  free: "Demo",
  basic: "Básico",
  premium: "Pro",
  business: "Business",
}

interface PlanDef {
  key: TenantPlan
  name: string
  monthlyPrice: number | null
  annualPrice: number | null   // total/año
  annualMonthly: number | null // equivalente mensual
  tagline: string
  features: string[]
  highlighted: boolean
}

const PLANS: PlanDef[] = [
  {
    key: "basic",
    name: "Básico",
    monthlyPrice: 9,
    annualPrice: 84,
    annualMonthly: 7,
    tagline: "Para freelancers y negocios pequeños.",
    features: [
      "50 cotizaciones por mes",
      "1 usuario",
      "PDF profesional con tu marca",
      "Seguimiento de estado",
      "Portal público de cotización",
    ],
    highlighted: false,
  },
  {
    key: "premium",
    name: "Pro",
    monthlyPrice: 15,
    annualPrice: 130,
    annualMonthly: 11,
    tagline: "Para equipos que necesitan escalar.",
    features: [
      "Cotizaciones ilimitadas",
      "Hasta 3 usuarios",
      "Integraciones API de catálogo",
      "PDF profesional con tu marca",
      "Seguimiento de estado",
      "Portal público de cotización",
      "Reportes avanzados",
    ],
    highlighted: true,
  },
  {
    key: "business",
    name: "Business",
    monthlyPrice: null,
    annualPrice: null,
    annualMonthly: null,
    tagline: "Para empresas con necesidades avanzadas.",
    features: [
      "Todo lo incluido en Pro",
      "Usuarios ilimitados",
      "Soporte prioritario",
      "Precio personalizado",
    ],
    highlighted: false,
  },
]

function PriceDisplay({ plan, interval }: { plan: PlanDef; interval: BillingInterval }) {
  if (plan.monthlyPrice === null) {
    return (
      <div className="mt-4">
        <span className="text-3xl font-bold">Personalizado</span>
      </div>
    )
  }
  const price = interval === "annual" ? plan.annualMonthly! : plan.monthlyPrice
  return (
    <div className="mt-4">
      <span className="text-4xl font-bold">${price}</span>
      <span className="ml-1 text-sm text-muted-foreground">/mes</span>
      {interval === "annual" && (
        <p className="mt-1 text-xs text-emerald-600 font-medium">
          ${plan.annualPrice}/año — ahorras ${plan.monthlyPrice * 12 - plan.annualPrice!}/año
        </p>
      )}
    </div>
  )
}

export default function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [interval, setInterval] = useState<BillingInterval>("monthly")

  const user = useAuthStore((s) => s.user)
  const accessToken = useAuthStore((s) => s.accessToken)
  const setSession = useAuthStore((s) => s.setSession)
  const currentPlan = user?.tenantPlan ?? "free"
  const isPaid = currentPlan !== "free"

  const success = searchParams.get("success") === "true"
  const cancelled = searchParams.get("cancelled") === "true"

  // Refresh plan from DB when returning from Stripe with ?success=true
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(async () => {
      try {
        const freshUser = await getMe()
        setSession(accessToken!, freshUser)
      } catch {
        // silent — plan badge will update on next natural refresh
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [success, accessToken, setSession])

  const checkoutMutation = useMutation({
    mutationFn: ({ plan, iv }: { plan: string; iv: BillingInterval }) =>
      createCheckoutSession(plan, iv),
    onSuccess: (url) => {
      window.location.href = url
    },
    onError: (err) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        "No se pudo iniciar el pago. Intenta de nuevo."
      toast.error(msg)
    },
  })

  const portalMutation = useMutation({
    mutationFn: createPortalSession,
    onSuccess: (url) => {
      window.location.href = url
    },
    onError: () => toast.error("No se pudo abrir el portal de facturación."),
  })

  function handleSelectPlan(plan: PlanDef) {
    if (plan.key === "business") {
      window.open("mailto:hola@cotix.app?subject=Plan Business", "_blank")
      return
    }
    checkoutMutation.mutate({ plan: plan.key, iv: interval })
  }

  function ctaLabel(plan: PlanDef): string {
    if (plan.key === currentPlan) return "Plan actual"
    if (plan.key === "business") return "Contactar"
    if (plan.key === "free") return "Plan actual"
    const planOrder: TenantPlan[] = ["free", "basic", "premium", "business"]
    const currentIdx = planOrder.indexOf(currentPlan)
    const targetIdx = planOrder.indexOf(plan.key)
    return targetIdx > currentIdx ? "Actualizar" : "Cambiar"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="label">Configuracion</p>
        <h2 className="mt-2 text-2xl font-bold">Facturación y plan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestiona tu suscripción y método de pago.
        </p>
      </div>

      {/* Feedback banners */}
      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="text-sm text-emerald-800">
            <p className="font-semibold">¡Suscripción activada!</p>
            <p className="mt-0.5">
              Tu plan se está actualizando. Si el badge del sidebar no cambia en unos segundos,
              cerrá sesión y volvé a entrar.
            </p>
          </div>
          <button
            className="ml-auto shrink-0 text-emerald-500 hover:text-emerald-700"
            onClick={() => setSearchParams({})}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      )}
      {cancelled && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p>Cancelaste el proceso de pago. Podés intentarlo de nuevo cuando quieras.</p>
          <button className="shrink-0 text-slate-400 hover:text-slate-600" onClick={() => setSearchParams({})}>✕</button>
        </div>
      )}

      {/* Billing interval toggle */}
      <div className="flex items-center gap-1 self-start rounded-lg border border-border bg-slate-50 p-1">
        <button
          type="button"
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition",
            interval === "monthly" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setInterval("monthly")}
        >
          Mensual
        </button>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition",
            interval === "annual" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setInterval("annual")}
        >
          Anual
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            -30%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === currentPlan
          const isLoading = checkoutMutation.isPending && checkoutMutation.variables?.plan === plan.key
          const label = ctaLabel(plan)

          return (
            <Card
              key={plan.key}
              className={cn(
                "relative flex flex-col transition",
                plan.highlighted && "border-primary shadow-md",
                isCurrent && "ring-2 ring-primary ring-offset-2",
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                    <Zap className="h-3 w-3" />
                    Más popular
                  </span>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {isCurrent && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      Plan actual
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <PriceDisplay plan={plan} interval={interval} />
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <ul className="flex-1 space-y-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlighted && !isCurrent ? "primary" : "secondary"}
                  disabled={isCurrent || checkoutMutation.isPending || portalMutation.isPending}
                  loading={isLoading}
                  onClick={() => !isCurrent && handleSelectPlan(plan)}
                >
                  {label}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Customer portal for existing subscribers */}
      {isPaid && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                <CreditCard className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold">Portal de facturación</p>
                <p className="text-xs text-muted-foreground">
                  Cambiá tu método de pago, descargá facturas o cancelá tu suscripción.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              loading={portalMutation.isPending}
              onClick={() => portalMutation.mutate()}
            >
              <ExternalLink className="h-4 w-4" />
              Gestionar facturación
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
