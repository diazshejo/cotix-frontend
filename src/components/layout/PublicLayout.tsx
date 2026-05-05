import { Outlet } from "react-router-dom"

export function PublicLayout() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:py-10">
      <Outlet />
    </main>
  )
}
