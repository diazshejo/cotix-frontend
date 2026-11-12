import { beforeEach, describe, expect, it } from "vitest"
import { queryClient } from "@/queryClient"
import { useAuthStore } from "@/stores/authStore"
import type { AuthUser } from "@/types/user"

const user: AuthUser = {
  id: "1",
  name: "Admin",
  email: "admin@example.com",
  role: "tenant_admin",
  tenantId: "tenant-a",
  tenantPlan: "free",
  tenantStatus: "active",
}

beforeEach(() => {
  queryClient.clear()
  useAuthStore.getState().clearSession()
})

describe("authStore cache isolation", () => {
  it("removes one account's cached data before another account signs in", () => {
    queryClient.setQueryData(["quotes"], ["tenant-a quote"])
    useAuthStore.getState().setSession({ ...user, id: "2", tenantId: "tenant-b" })

    expect(queryClient.getQueryData(["quotes"])).toBeUndefined()
    expect(useAuthStore.getState().user?.tenantId).toBe("tenant-b")
  })

  it("removes cached data on logout", () => {
    useAuthStore.getState().setSession(user)
    queryClient.setQueryData(["quotes"], ["tenant-a quote"])
    useAuthStore.getState().clearSession()

    expect(queryClient.getQueryData(["quotes"])).toBeUndefined()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
