import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/responsive",
  testMatch: "**/*.pw.ts",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
  projects: [
    { name: "360x740", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 740 } } },
    { name: "390x844", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "768x1024", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "1366x768", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } } },
  ],
})
