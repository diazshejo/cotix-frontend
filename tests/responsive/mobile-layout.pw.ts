import { expect, test, type Page } from "@playwright/test"

const protectedRoutes = [
  "/app/dashboard",
  "/app/quotes",
  "/app/quotes/new",
  "/app/settings/integrations",
  "/app/settings/company",
]

async function mockApi(page: Page) {
  await page.route("**/api/auth/refresh/", async (route) => {
    await route.fulfill({ json: { access: "e2e-token" } })
  })

  await page.route("**/api/auth/me/", async (route) => {
    await route.fulfill({
      json: {
        id: "u1",
        email: "admin@cotix.test",
        name: "Admin Cotix",
        role: "admin",
        tenant_id: "t1",
      },
    })
  })

  await page.route("**/api/integrations/catalog/", async (route) => {
    await route.fulfill({
      json: [
        {
          id: "int-1",
          name: "Catalogo REST",
          integration_type: "rest_api",
          endpoint_url: "https://api.example.com/products",
          http_method: "GET",
          auth_type: "bearer",
          auth_header_name: "Authorization",
          has_credentials: true,
          request_body_template: "",
          field_mapping: { name: "name", unit_price: "price" },
          response_array_path: "items",
          pre_import_filters: [],
          price_conflict_policy: "overwrite",
          sync_mode: "manual",
          sync_frequency_hours: null,
          next_sync_at: null,
          last_synced_at: null,
          last_sync_status: "",
          last_sync_created: 0,
          last_sync_updated: 0,
          last_sync_skipped: 0,
          last_sync_errors: 0,
          last_sync_error_detail: "",
          is_active: false,
          created_at: "2026-05-01T00:00:00Z",
          updated_at: "2026-05-01T00:00:00Z",
        },
      ],
    })
  })
}

async function expectNoHorizontalScroll(page: Page) {
  const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  expect(hasHorizontalScroll).toBe(false)
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test("login renders without horizontal scroll", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("button", { name: /ingresar/i })).toBeVisible()
  await expectNoHorizontalScroll(page)
})

for (const path of protectedRoutes) {
  test(`${path} renders without horizontal scroll`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState("networkidle")
    await expect(page.locator("#root")).toBeVisible()
    await expectNoHorizontalScroll(page)
  })
}
