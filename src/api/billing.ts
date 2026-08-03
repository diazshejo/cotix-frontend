import { apiClient } from "@/api/client"

export type BillingInterval = "monthly" | "annual"

export async function createCheckoutSession(plan: string, interval: BillingInterval): Promise<string> {
  const res = await apiClient.post<{ checkout_url: string }>("/tenant/billing/checkout/", { plan, interval })
  return res.data.checkout_url
}

export async function createPortalSession(): Promise<string> {
  const res = await apiClient.post<{ portal_url: string }>("/tenant/billing/portal/")
  return res.data.portal_url
}
