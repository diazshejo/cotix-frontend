import { Suspense, lazy } from "react"
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
import { Skeleton } from "@/components/common/Skeleton"
import { AppLayout } from "@/components/layout/AppLayout"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { routes } from "@/constants/routes"
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"))
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"))
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"))
const QuotesListPage = lazy(() => import("@/features/quotes/pages/QuotesListPage"))
const QuoteDetailPage = lazy(() => import("@/features/quotes/pages/QuoteDetailPage"))
const QuoteBuilderPage = lazy(() => import("@/features/quotes/pages/QuoteBuilderPage"))
const ClientsListPage = lazy(() => import("@/features/clients/pages/ClientsListPage"))
const CatalogItemsPage = lazy(() => import("@/features/catalog/pages/CatalogItemsPage"))
const ReportsPage = lazy(() => import("@/features/reports/pages/ReportsPage"))
const CompanySettingsPage = lazy(() => import("@/features/settings/pages/CompanySettingsPage"))
const PublicQuotePage = lazy(() => import("@/features/public/pages/PublicQuotePage"))
const LandingPage = lazy(() => import("@/features/marketing/pages/LandingPage"))

function PageLoader() {
  return (
    <div className="space-y-4 p-4 xl:p-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function withSuspense(element: JSX.Element) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

const router = createBrowserRouter([
  { path: routes.home, element: withSuspense(<LandingPage />) },
  { path: routes.login, element: withSuspense(<LoginPage />) },
  { path: "/auth/login", element: <Navigate to={routes.login} replace /> },
  { path: routes.register, element: withSuspense(<RegisterPage />) },
  { path: "/auth/register", element: <Navigate to={routes.register} replace /> },
  { path: routes.forgotPassword, element: withSuspense(<ForgotPasswordPage />) },
  { path: "/auth/forgot-password", element: <Navigate to={routes.forgotPassword} replace /> },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={routes.dashboard} replace /> },
      { path: "dashboard", element: <ProtectedRoute resource="dashboard">{withSuspense(<DashboardPage />)}</ProtectedRoute> },
      { path: "quotes", element: <ProtectedRoute resource="quotes">{withSuspense(<QuotesListPage />)}</ProtectedRoute> },
      { path: "quotes/:id", element: <ProtectedRoute resource="quotes">{withSuspense(<QuoteDetailPage />)}</ProtectedRoute> },
      { path: "quotes/new", element: <ProtectedRoute resource="quoteBuilder">{withSuspense(<QuoteBuilderPage />)}</ProtectedRoute> },
      { path: "clients", element: <ProtectedRoute resource="clients">{withSuspense(<ClientsListPage />)}</ProtectedRoute> },
      { path: "catalog/items", element: <ProtectedRoute resource="catalog">{withSuspense(<CatalogItemsPage />)}</ProtectedRoute> },
      { path: "catalog/categories", element: <ProtectedRoute resource="catalog">{withSuspense(<CatalogItemsPage />)}</ProtectedRoute> },
      { path: "reports", element: <ProtectedRoute resource="reports">{withSuspense(<ReportsPage />)}</ProtectedRoute> },
      { path: "settings/company", element: <ProtectedRoute resource="settings">{withSuspense(<CompanySettingsPage />)}</ProtectedRoute> },
    ],
  },
  {
    path: "/q",
    element: <PublicLayout />,
    children: [{ path: ":token", element: withSuspense(<PublicQuotePage />) }],
  },
])

export default function App() {
  return (
    <AuthBootstrap>
      <RouterProvider router={router} />
    </AuthBootstrap>
  )
}
