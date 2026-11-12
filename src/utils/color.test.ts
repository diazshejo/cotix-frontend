import { describe, expect, it } from "vitest"

import { brandForegroundColor, safeBrandColor } from "@/utils/color"

describe("portal brand colors", () => {
  it("uses readable text on light and dark company colors", () => {
    expect(brandForegroundColor("#fff4bf")).toBe("#0f172a")
    expect(brandForegroundColor("#0e7490")).toBe("#ffffff")
  })

  it("rejects invalid colors from API data", () => {
    expect(safeBrandColor("red; background: url(evil)")).toBe("#1a6fdb")
    expect(safeBrandColor("#123abc")).toBe("#123abc")
  })
})
