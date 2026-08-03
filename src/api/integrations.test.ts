import axios from "axios"
import { describe, expect, it } from "vitest"

import { isPlanRestriction } from "@/api/integrations"

function axiosError(status: number, detail: string) {
  return new axios.AxiosError("Request failed", undefined, undefined, undefined, {
    status,
    statusText: "Error",
    headers: {},
    config: { headers: new axios.AxiosHeaders() },
    data: { detail },
  })
}

describe("isPlanRestriction", () => {
  it("detects plan 403 responses for upsell", () => {
    const error = axiosError(403, "Tu plan no incluye integraciones de catalogo. Actualiza a Premium o Business.")

    expect(isPlanRestriction(error)).toBe(true)
  })

  it("does not classify unrelated 403 responses as plan restrictions", () => {
    const error = axiosError(403, "No tienes permiso para cambiar este recurso.")

    expect(isPlanRestriction(error)).toBe(false)
  })
})
