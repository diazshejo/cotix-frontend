import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ConfirmProvider } from "@/components/common/ConfirmDialog"

describe("ConfirmProvider", () => {
  it("renders children without an open dialog", () => {
    const html = renderToString(
      <ConfirmProvider>
        <div>Contenido</div>
      </ConfirmProvider>,
    )

    expect(html).toContain("Contenido")
  })
})
