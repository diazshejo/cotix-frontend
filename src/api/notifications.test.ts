import { describe, expect, it } from "vitest"

import { notificationSocketUrl } from "@/api/notifications"

describe("notificationSocketUrl", () => {
  it("uses secure WebSocket for an HTTPS API without forwarding query parameters", () => {
    expect(notificationSocketUrl("https://api.cotix.example/api?token=unsafe", "https://cotix.example"))
      .toBe("wss://api.cotix.example/api/notifications/ws/")
  })

  it("uses the API base path and local WebSocket protocol", () => {
    expect(notificationSocketUrl("/api/", "http://localhost:5173"))
      .toBe("ws://localhost:5173/api/notifications/ws/")
  })
})
