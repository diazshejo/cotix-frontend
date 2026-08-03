import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Send,
  BarChart3,
  Shield,
  Palette,
  Package,
  ChevronDown,
  Star,
  Users,
  Zap,
  Eye,
  Globe,
  MessageCircle,
  Mail,
  Phone,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { routes } from "@/constants/routes"

// ─── Data ──────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: FileText,
    title: "Cotizaciones profesionales en minutos",
    description:
      "Olvida las hojas de cálculo y el Word. Crea propuestas con descuentos, impuestos y vista previa en tiempo real directamente desde tu navegador.",
  },
  {
    icon: Eye,
    title: "Portal de cliente sin fricción",
    description:
      "Tu cliente recibe un enlace y acepta o rechaza la cotización online sin necesidad de crear cuenta ni instalar nada.",
  },
  {
    icon: Package,
    title: "Catálogo de productos integrado",
    description:
      "Sube tu lista de precios una sola vez. Cotiza siempre con productos actualizados y sin errores de copia y pega.",
  },
  {
    icon: Shield,
    title: "Firma y aceptación digital",
    description:
      "Rastrea con precisión cuándo el cliente vio, abrió y respondió tu propuesta. Nunca más el clásico \"no me llegó\".",
  },
  {
    icon: Palette,
    title: "Control de marca completo",
    description:
      "Tu logo, tus colores y tu pie de página en cada documento. Proyecta profesionalismo desde el primer contacto.",
  },
  {
    icon: BarChart3,
    title: "Reportes de conversión y pipeline",
    description:
      "Visualiza qué propuestas ganaste, perdiste o siguen pendientes. Toma decisiones con datos reales de tu negocio.",
  },
]

const steps = [
  {
    icon: Users,
    title: "Crea tu cuenta",
    description: "Regístrate gratis en 30 segundos, sin tarjeta de crédito.",
  },
  {
    icon: Package,
    title: "Agrega tu catálogo",
    description: "Importa o ingresa tus productos, precios y categorías.",
  },
  {
    icon: Send,
    title: "Envía la cotización",
    description: "Comparte por email, PDF o WhatsApp con un solo clic.",
  },
  {
    icon: CheckCircle2,
    title: "El cliente responde online",
    description: "Acepta, rechaza o solicita cambios desde su dispositivo.",
  },
]

const testimonials = [
  {
    name: "Carlos Mendoza",
    role: "Director Comercial",
    company: "Importadora del Norte, S.A.",
    quote:
      "Antes tardábamos 3 horas preparando una cotización en Excel. Con Cotix lo hacemos en 15 minutos y el cliente puede aceptar desde el celular. Cerramos un 40% más de negocios el primer mes.",
    stars: 5,
  },
  {
    name: "María Fernanda Estrada",
    role: "Gerente de Ventas",
    company: "Grupo Logístico Centroamericano",
    quote:
      "El portal del cliente es lo que me enamoró. Mis clientes ya no me preguntan '¿me puedes reenviar la coti?' Todo está en línea, profesional y con nuestra marca.",
    stars: 5,
  },
  {
    name: "Roberto Xicará",
    role: "Freelancer de Diseño Gráfico",
    company: "Estudio RX Creativos",
    quote:
      "Soy diseñador, no contador. Cotix me dio una herramienta que me hace ver como una agencia grande ante mis clientes. Vale cada centavo del plan básico.",
    stars: 5,
  },
]

const faqs = [
  {
    q: "¿Necesito tarjeta de crédito para probar Cotix?",
    a: "No. La prueba gratuita de 30 días está disponible sin ingresar ningún dato de pago. Solo necesitas un correo electrónico para empezar hoy mismo.",
  },
  {
    q: "¿Puedo personalizar las cotizaciones con mi logo y colores?",
    a: "Sí. Puedes subir tu logo, definir el color de encabezado y personalizar el pie de página en la sección de configuración de empresa. Cada PDF y portal público reflejará tu identidad de marca.",
  },
  {
    q: "¿Cómo ve el cliente la cotización?",
    a: "Recibirá un enlace único (sin contraseña) que abre un portal web profesional. Ahí puede ver todos los detalles, descargar el PDF y hacer clic en 'Aceptar' o 'Rechazar'. Tú recibirás una notificación instantánea.",
  },
  {
    q: "¿Funciona para freelancers individuales y para empresas con equipo?",
    a: "Absolutamente. El plan Básico es ideal para freelancers y negocios unipersonales. El plan Pro soporta hasta 3 usuarios simultáneos, perfecto para equipos de ventas pequeños.",
  },
  {
    q: "¿Qué pasa si supero el límite de cotizaciones de mi plan?",
    a: "Te avisaremos cuando estés cerca del límite. Podrás actualizar a Pro en cualquier momento con un solo clic. No te bloqueamos ni te cortamos el servicio de forma abrupta.",
  },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [billingAnnual, setBillingAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    document.title = "Cotix — Cotizaciones Digitales para Empresas en Guatemala y Centroamérica"
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute(
        "content",
        "Cotix es el cotizador en línea para empresas y freelancers de Guatemala. Crea propuestas profesionales, envíalas por WhatsApp o email y deja que tu cliente acepte online. Prueba gratis 30 días."
      )
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-white/10 bg-slate-950/95 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
          aria-label="Navegación principal"
        >
          {/* Logo */}
          <Link to={routes.home} className="flex items-center gap-3 group" aria-label="Cotix inicio">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(103,232,249,0.4)] transition-shadow group-hover:shadow-[0_0_30px_rgba(103,232,249,0.6)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Cotix</span>
          </Link>

          {/* Links */}
          <div className="hidden items-center gap-1 md:flex">
            <a
              href="#caracteristicas"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              Características
            </a>
            <a
              href="#precios"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              Precios
            </a>
            <a
              href="#demo"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
            >
              Demo
            </a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <Link
              to={routes.login}
              className="hidden rounded-md px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/8 hover:text-white sm:inline-flex"
            >
              Ingresar
            </Link>
            <Link to={routes.register}>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-cyan-300 px-4 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(103,232,249,0.3)] transition hover:bg-cyan-200 hover:shadow-[0_0_30px_rgba(103,232,249,0.5)]">
                Crear cuenta gratis
              </button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ── HERO ────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 pb-20 pt-32 lg:pt-40">
          {/* Background glow blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_500px] lg:items-center lg:gap-16 lg:px-8">
            {/* Left: Copy */}
            <div className="flex flex-col">
              {/* Badge */}
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-1.5 text-sm font-semibold text-cyan-200 backdrop-blur-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                Prueba gratis 30 días · Sin tarjeta de crédito
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Cotizaciones digitales{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  profesionales
                </span>{" "}
                para empresas en{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                  Guatemala
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                El cotizador en línea para empresas que reemplaza el Excel y el Word. Crea propuestas
                comerciales, envíalas por email o WhatsApp, y deja que tu cliente las acepte online sin
                crear cuenta. Con seguimiento comercial integrado.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={routes.register}>
                  <button className="inline-flex h-12 items-center gap-2 rounded-xl bg-cyan-300 px-6 text-base font-bold text-slate-950 shadow-[0_0_40px_rgba(103,232,249,0.3)] transition hover:bg-cyan-200 hover:shadow-[0_0_60px_rgba(103,232,249,0.5)]">
                    Crear cuenta gratis
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <a
                  href="#demo"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-6 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  <Eye className="h-4 w-4" />
                  Ver demostración
                </a>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
                {[
                  { value: "500+", label: "empresas activas" },
                  { value: "10,000+", label: "cotizaciones enviadas" },
                  { value: "98%", label: "tasa de entrega" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent sm:text-3xl">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Quote card mock */}
            <div className="relative">
              <div
                aria-label="Vista previa de cotización digital en Cotix"
                className="rounded-2xl border border-white/15 bg-white/8 p-3 shadow-[0_0_60px_rgba(6,182,212,0.15)] backdrop-blur-xl"
              >
                {/* Card header */}
                <div className="rounded-xl bg-white p-5 text-slate-950 shadow-sm">
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Cotización
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-slate-900">COT-2026-0047</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-500">
                        Distribuidora Centroamérica S.A.
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      Pendiente
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      { name: "Licencia Cotix Pro (anual)", qty: "5 usuarios", price: "Q 8,900.00" },
                      { name: "Implementación y configuración", qty: "1 sesión", price: "Q 3,500.00" },
                      { name: "Capacitación equipo comercial", qty: "2 hrs", price: "Q 1,800.00" },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.qty}</p>
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-950 p-4 text-white">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Subtotal</span>
                      <span>Q 14,200.00</span>
                    </div>
                    <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                      <span>IVA (12%)</span>
                      <span>Q 1,704.00</span>
                    </div>
                    <div className="mt-3 flex justify-between border-t border-white/15 pt-3 text-lg font-extrabold">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                        Q 15,904.00
                      </span>
                    </div>
                  </div>

                  <button className="mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500">
                    ✓ Aceptar cotización
                  </button>
                </div>
              </div>

              {/* Floating badge */}
              <div
                aria-hidden="true"
                className="absolute -right-3 -top-3 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-sm"
              >
                ✓ Visto hace 2 min
              </div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF STRIP ──────────────────────────────────────────────── */}
        <section className="border-y border-slate-800 bg-slate-900/80 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
              Usado por empresas en toda Centroamérica
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                "Importadora del Norte",
                "Grupo RX Creativos",
                "Logística Central GT",
                "Distribuidora CA S.A.",
                "Inversiones Pacífico",
                "TechSoluciones GT",
              ].map((name) => (
                <span
                  key={name}
                  className="text-sm font-semibold text-slate-600 transition hover:text-slate-400"
                >
                  {name}
                </span>
              ))}
            </div>
            <div
              aria-hidden="true"
              className="mx-auto mt-8 h-px max-w-sm bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
            />
            <blockquote className="mx-auto mt-6 max-w-xl text-center">
              <p className="text-base italic leading-relaxed text-slate-300">
                "Cerramos 3 ventas en la primera semana usando Cotix. El portal del cliente lo cambió
                todo."
              </p>
              <cite className="mt-3 block text-sm font-semibold text-slate-500 not-italic">
                — Ana López, Gerente Comercial · Inversiones Pacífico
              </cite>
            </blockquote>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────────────── */}
        <section id="caracteristicas" className="bg-white py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
                Software de cotización
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Todo lo que necesitas para cerrar más ventas
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-500">
                Propuestas comerciales profesionales sin hojas de cálculo, sin Word y sin caos de versiones.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <article
                  key={f.title}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_8px_30px_rgba(6,182,212,0.12)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-b from-slate-950 to-slate-900 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Cotizador online
              </p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                ¿Cómo funciona Cotix?
              </h2>
              <p className="mt-4 text-slate-400">
                De cero a cotización enviada en menos de 3 minutos.
              </p>
            </div>

            {/* Steps */}
            <div className="relative mt-16">
              {/* Connector line (desktop) */}
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent lg:block"
              />
              <div className="grid gap-8 lg:grid-cols-4">
                {steps.map((step, i) => (
                  <div key={step.title} className="relative flex flex-col items-center text-center">
                    <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-cyan-400/30 bg-slate-800 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400 text-xs font-extrabold text-slate-950">
                        {i + 1}
                      </span>
                      <step.icon className="h-7 w-7 text-cyan-400" />
                    </div>
                    <h3 className="mt-5 text-base font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DEMO VISUAL ─────────────────────────────────────────────────────── */}
        <section id="demo" className="bg-slate-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Vista del producto
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Tu cotización en 3 minutos
              </h2>
              <p className="mt-4 text-slate-400">
                Así se ve el constructor de propuestas comerciales de Cotix.
              </p>
            </div>

            <div className="mt-12">
              {/* Browser chrome mock */}
              <div
                aria-label="Simulación del panel de construcción de cotizaciones en Cotix"
                className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-950 shadow-[0_0_80px_rgba(6,182,212,0.12)]"
              >
                {/* Browser bar */}
                <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/70" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                    <div className="h-3 w-3 rounded-full bg-green-500/70" />
                  </div>
                  <div className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5">
                    <Globe className="h-3 w-3 text-slate-500" />
                    <span className="text-xs text-slate-500">app.cotix.io/quotes/new</span>
                  </div>
                </div>

                {/* App layout mock */}
                <div className="grid lg:grid-cols-[220px_1fr] min-h-[420px]">
                  {/* Sidebar */}
                  <div className="border-r border-white/8 p-4 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Cliente</p>
                    <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/8 p-3">
                      <p className="text-sm font-bold text-white">Distribuidora GT</p>
                      <p className="text-xs text-slate-400">contacto@distrigt.com</p>
                    </div>
                    <div
                      aria-hidden="true"
                      className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Productos
                    </p>
                    {["Licencia Pro", "Implementación", "Soporte anual"].map((p) => (
                      <div
                        key={p}
                        className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-xs text-slate-300"
                      >
                        <Package className="h-3 w-3 text-cyan-400" />
                        {p}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          Nueva cotización
                        </p>
                        <p className="mt-1 text-lg font-extrabold text-white">COT-2026-0048</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                          Vista previa
                        </div>
                        <div className="rounded-md bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950">
                          Enviar
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { name: "Licencia Pro Anual", qty: "3", unit: "Q 2,600", total: "Q 7,800" },
                        { name: "Implementación", qty: "1", unit: "Q 3,500", total: "Q 3,500" },
                        { name: "Soporte Anual", qty: "1", unit: "Q 1,200", total: "Q 1,200" },
                      ].map((row) => (
                        <div
                          key={row.name}
                          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-lg border border-white/8 bg-white/4 px-4 py-3 text-sm"
                        >
                          <span className="font-medium text-slate-200">{row.name}</span>
                          <span className="text-slate-500">{row.qty}</span>
                          <span className="text-slate-400">{row.unit}</span>
                          <span className="font-bold text-white">{row.total}</span>
                        </div>
                      ))}
                    </div>

                    <div className="ml-auto w-60 rounded-xl bg-slate-800 p-4 space-y-2">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Subtotal</span>
                        <span>Q 12,500.00</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>IVA 12%</span>
                        <span>Q 1,500.00</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2 text-base font-extrabold text-white">
                        <span>Total</span>
                        <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                          Q 14,000.00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────────────── */}
        <section id="precios" className="bg-white py-20 text-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">Precios</p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Planes para cada etapa de tu negocio
              </h2>
              <p className="mt-4 text-slate-500">
                Empieza gratis. Escala cuando lo necesites.
              </p>

              {/* Toggle */}
              <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 p-1">
                <button
                  onClick={() => setBillingAnnual(false)}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                    !billingAnnual
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingAnnual(true)}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition ${
                    billingAnnual
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Anual
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Ahorra $50
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-start">
              {/* Básico */}
              <div className="rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Básico</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    ${billingAnnual ? "7" : "9"}
                  </span>
                  <span className="mb-1 text-sm text-slate-400">/mes</span>
                </div>
                {billingAnnual && (
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">Facturado anualmente</p>
                )}
                <p className="mt-4 text-sm text-slate-500">
                  Perfecto para freelancers y negocios unipersonales.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "50 cotizaciones/mes",
                    "1 usuario",
                    "PDF profesional con logo",
                    "Portal de cliente",
                    "Soporte por email",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to={routes.register} className="mt-8 block">
                  <button className="w-full rounded-xl border border-slate-300 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                    Empezar gratis
                  </button>
                </Link>
              </div>

              {/* Pro — POPULAR */}
              <div className="relative rounded-2xl border-2 border-cyan-400 bg-slate-950 p-7 shadow-[0_0_40px_rgba(6,182,212,0.2)] ring-2 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_60px_rgba(6,182,212,0.3)]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400 px-4 py-1 text-xs font-extrabold text-slate-950">
                    <Zap className="h-3 w-3" />
                    Más popular
                  </span>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">Pro</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${billingAnnual ? "11" : "15"}
                  </span>
                  <span className="mb-1 text-sm text-slate-400">/mes</span>
                </div>
                {billingAnnual && (
                  <p className="mt-1 text-xs text-emerald-400 font-semibold">Facturado anualmente</p>
                )}
                <p className="mt-4 text-sm text-slate-400">
                  Para equipos de ventas que quieren crecer más rápido.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Cotizaciones ilimitadas",
                    "3 usuarios incluidos",
                    "Todo lo del plan Básico",
                    "Reportes avanzados de pipeline",
                    "Catálogo con integraciones",
                    "Firma y aceptación digital",
                    "Soporte prioritario",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to={routes.register} className="mt-8 block">
                  <button className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-extrabold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                    Empezar gratis →
                  </button>
                </Link>
              </div>

              {/* Pro Anual */}
              <div className="rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Pro Anual</p>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                    Ahorra $50
                  </span>
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">$130</span>
                  <span className="mb-1 text-sm text-slate-400">/año</span>
                </div>
                <p className="mt-1 text-xs text-emerald-600 font-semibold">
                  Equivale a 2 meses gratis vs. plan mensual
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  Todo Pro con el mejor precio del año.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Todo lo del plan Pro",
                    "2 meses gratis incluidos",
                    "Facturación anual simplificada",
                    "Acceso anticipado a nuevas funciones",
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to={routes.register} className="mt-8 block">
                  <button className="w-full rounded-xl border border-slate-300 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                    Elegir Pro Anual
                  </button>
                </Link>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-400">
              Todos los planes incluyen <strong>30 días gratis</strong>. Sin tarjeta de crédito.
              Cancela cuando quieras.
            </p>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
        <section className="bg-slate-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Testimonios</p>
              <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                Empresas centroamericanas que ya confían en Cotix
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {testimonials.map((t) => (
                <article
                  key={t.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_8px_30px_rgba(6,182,212,0.1)]"
                >
                  <div className="flex gap-0.5" aria-label={`${t.stars} estrellas de 5`}>
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-slate-300">
                    "{t.quote}"
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 text-sm font-extrabold text-slate-950">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">
                        {t.role} · {t.company}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20 text-slate-950">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">FAQ</p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                Preguntas frecuentes
              </h2>
            </div>

            <div className="mt-12 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-slate-50"
                    aria-expanded={openFaq === i}
                  >
                    <span className="pr-4 text-sm font-bold text-slate-900 sm:text-base">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        openFaq === i ? "rotate-180 text-cyan-600" : ""
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5">
                      <p className="text-sm leading-relaxed text-slate-600">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ───────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950/40 to-slate-950 py-24 text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/8 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-sm font-semibold text-cyan-200">
              <Award className="h-4 w-4" />
              Únete a más de 500 empresas centroamericanas
            </div>

            <h2 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Empieza a cerrar ventas{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                más rápido.
              </span>
            </h2>

            <p className="mt-6 text-lg text-slate-300">
              Únete a cientos de empresas centroamericanas que ya usan Cotix para enviar propuestas
              profesionales y ganar más clientes.
            </p>

            <Link to={routes.register} className="mt-10 inline-block">
              <button className="inline-flex h-14 items-center gap-3 rounded-2xl bg-cyan-400 px-8 text-lg font-extrabold text-slate-950 shadow-[0_0_60px_rgba(6,182,212,0.4)] transition hover:bg-cyan-300 hover:shadow-[0_0_80px_rgba(6,182,212,0.6)]">
                Crear mi cuenta gratis
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {["Sin tarjeta de crédito", "Cancela cuando quieras", "Soporte en español"].map(
                (badge) => (
                  <span
                    key={badge}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {badge}
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950 py-14 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <Link to={routes.home} className="flex items-center gap-2.5 group" aria-label="Cotix inicio">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-base font-extrabold text-white">Cotix</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                El cotizador online para empresas y freelancers de Guatemala y Centroamérica. Propuestas
                profesionales, portal de cliente y seguimiento comercial en un solo lugar.
              </p>
              <div className="mt-5 flex gap-3">
                <a
                  href="#"
                  aria-label="Cotix en Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition hover:border-slate-600 hover:text-slate-300"
                >
                  <Globe className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Contactar Cotix por WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition hover:border-slate-600 hover:text-slate-300"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-600">
                Producto
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#caracteristicas" className="transition hover:text-slate-200">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#precios" className="transition hover:text-slate-200">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#demo" className="transition hover:text-slate-200">
                    Demo
                  </a>
                </li>
                <li>
                  <Link to={routes.register} className="transition hover:text-slate-200">
                    Crear cuenta gratis
                  </Link>
                </li>
                <li>
                  <Link to={routes.login} className="transition hover:text-slate-200">
                    Ingresar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-600">
                Legal
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="transition hover:text-slate-200">
                    Términos de servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-slate-200">
                    Política de privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-slate-200">
                    Cookies
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-slate-200">
                    Acuerdo de datos (DPA)
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-600">
                Contacto
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-slate-600" />
                  <a href="mailto:hola@cotix.io" className="transition hover:text-slate-200">
                    hola@cotix.io
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 shrink-0 text-slate-600" />
                  <a href="#" className="transition hover:text-slate-200">
                    WhatsApp soporte
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-slate-600" />
                  <a href="tel:+50222000000" className="transition hover:text-slate-200">
                    +502 2200-0000
                  </a>
                </li>
                <li className="mt-2 flex items-start gap-2">
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-xs text-slate-500">
                    Soporte en español · Lun–Vie 8am–6pm (GT)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="my-10 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"
          />

          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-600 sm:flex-row">
            <p>© 2026 Cotix. Todos los derechos reservados. Hecho con orgullo en Guatemala.</p>
            <div className="flex gap-4">
              <a href="#" className="transition hover:text-slate-400">
                Términos
              </a>
              <a href="#" className="transition hover:text-slate-400">
                Privacidad
              </a>
              <a href="#" className="transition hover:text-slate-400">
                Estado del sistema
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/*
        Schema Markup — JSON-LD (SoftwareApplication)
        Paste inside a <script type="application/ld+json"> tag in index.html
        for production SEO.

        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Cotix",
          "url": "https://cotix.io",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "Software de cotización digital para PYMEs, empresas y freelancers de Guatemala y Centroamérica. Crea propuestas profesionales, envíalas por email o WhatsApp y permite a tus clientes aceptarlas online.",
          "offers": [
            {
              "@type": "Offer",
              "name": "Plan Básico",
              "price": "9.00",
              "priceCurrency": "USD",
              "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" }
            },
            {
              "@type": "Offer",
              "name": "Plan Pro",
              "price": "15.00",
              "priceCurrency": "USD",
              "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1M" }
            },
            {
              "@type": "Offer",
              "name": "Plan Pro Anual",
              "price": "130.00",
              "priceCurrency": "USD",
              "priceSpecification": { "@type": "UnitPriceSpecification", "billingDuration": "P1Y" }
            }
          ],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "reviewCount": "3"
          }
        }
      */}
    </>
  )
}
