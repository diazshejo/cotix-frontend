import { Outlet } from "react-router-dom"
import { useState } from "react"
import { Header } from "@/components/layout/Header"
import { MobileSidebar, Sidebar } from "@/components/layout/Sidebar"

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
