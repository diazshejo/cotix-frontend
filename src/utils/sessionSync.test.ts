import { describe, expect, it, vi } from "vitest"
import { publishSessionEvent, SESSION_EVENT } from "@/utils/sessionSync"

describe("sessionSync", () => {
  it("publishes session events to localStorage fallback", () => {
    const setItem = vi.fn()
    vi.stubGlobal("localStorage", { setItem })

    publishSessionEvent("logout")

    expect(setItem).toHaveBeenCalledWith(SESSION_EVENT, expect.stringMatching(/^logout:/))
    vi.unstubAllGlobals()
  })
})
