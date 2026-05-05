import { Link } from "react-router-dom"
import { ArrowRight, BarChart3, CheckCircle2, FileText, Send, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { routes } from "@/constants/routes"

const benefits = [
  {
    icon: FileText,
    title: "Cotizaciones en minutos",
    description: "Construye propuestas con clientes, catalogo, descuentos, impuestos y preview comercial en tiempo real.",
  },
  {
    icon: Send,
    title: "Envio y portal publico",
    description: "Comparte un enlace para que el cliente vea, descargue, acepte o rechace sin crear cuenta.",
  },
  {
    icon: BarChart3,
    title: "Seguimiento comercial",
    description: "Visualiza conversion, montos aceptados, cotizaciones vencidas y productos mas cotizados.",
  },
]

const steps = ["Selecciona cliente", "Agrega catalogo", "Revisa preview", "Envia y mide"]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to={routes.home} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300 text-slate-950">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-bold">Cotix</p>
            <p className="text-xs text-slate-400">Cotizador digital SaaS</p>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link className="hidden rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:inline-flex" to={routes.login}>
            Ingresar
          </Link>
          <Link to={routes.register}>
            <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">Crear cuenta</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8 lg:pb-24 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            Preparado para equipos B2B modernos
          </div>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Cotizaciones comerciales listas para enviar, aceptar y medir.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Cotix ayuda a negocios a crear propuestas profesionales con control de marca, portal publico para clientes y seguimiento claro del pipeline comercial.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={routes.register}>
              <Button className="h-12 bg-cyan-300 px-5 text-slate-950 hover:bg-cyan-200">
                Empezar ahora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/q/demo-token">
              <Button variant="secondary" className="h-12 border-white/15 bg-white/10 px-5 text-white hover:bg-white/15">
                Ver portal publico
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-soft backdrop-blur">
          <div className="rounded-md bg-white p-5 text-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Preview Cotix</p>
                <h2 className="mt-1 text-xl font-bold">COT-2026-0047</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Vista</span>
            </div>
            <div className="grid gap-3 py-5">
              {["Licencia Cotix Pro", "Implementacion inicial", "Capacitacion comercial"].map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                  <div>
                    <p className="font-semibold">{item}</p>
                    <p className="text-xs text-slate-500">Linea #{index + 1}</p>
                  </div>
                  <strong>Q {(8900 - index * 1800).toLocaleString("es-GT")}</strong>
                </div>
              ))}
            </div>
            <div className="rounded-md bg-slate-950 p-4 text-white">
              <div className="flex justify-between text-sm text-slate-300"><span>Subtotal</span><span>Q 16,290.00</span></div>
              <div className="mt-2 flex justify-between text-sm text-slate-300"><span>IVA</span><span>Q 1,954.80</span></div>
              <div className="mt-3 flex justify-between border-t border-white/15 pt-3 text-xl font-bold"><span>Total</span><span>Q 18,244.80</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="label">Producto</p>
            <h2 className="mt-2 text-3xl font-bold">Un flujo completo para vender mejor</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-100 text-cyan-800">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-16 text-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="label">Flujo comercial</p>
              <h2 className="mt-2 text-3xl font-bold">De borrador a respuesta del cliente</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">El MVP esta preparado para conectar con Django REST, roles por equipo y portal publico sin friccion.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <div key={step} className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">{index + 1}</div>
                  <p className="mt-4 font-bold">{step}</p>
                  <CheckCircle2 className="mt-5 h-5 w-5 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
