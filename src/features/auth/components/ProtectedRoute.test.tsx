import { renderToString } from "react-dom/server"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it } from "vitest"
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute"
import { useAuthStore } from "@/stores/authStore"

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, status: "guest" })
  })

  it("does not render protected content for guests", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <Routes>
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <div>Contenido privado</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(html).not.toContain("Contenido privado")
  })
})
