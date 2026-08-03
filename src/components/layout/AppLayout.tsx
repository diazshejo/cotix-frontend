import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getCompanySettings } from "@/api/settings"
import { Header } from "@/components/layout/Header"
import { MobileSidebar, Sidebar } from "@/components/layout/Sidebar"
import { queryKeys } from "@/constants/queryKeys"
import { applyBrandColor } from "@/utils/color"

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: settings } = useQuery({
    queryKey: queryKeys.companySettings,
    queryFn: getCompanySettings,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (settings?.brandColor) applyBrandColor(settings.brandColor)
  }, [settings?.brandColor])

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="min-w-0 flex-1">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="px-4 py-6 xl:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
