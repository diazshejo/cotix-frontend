import { apiClient } from "@/api/client"
import type { Notification, UnreadCountResponse } from "@/types/notification"

export function notificationSocketUrl(
  apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  siteOrigin = window.location.origin,
): string {
  const url = new URL(apiUrl, siteOrigin)
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  url.pathname = `${url.pathname.replace(/\/$/, "")}/notifications/ws/`
  url.search = ""
  url.hash = ""
  return url.toString()
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiClient.get<UnreadCountResponse>("/notifications/unread_count/")
  return res.data.unread_count
}

export async function fetchRecentNotifications(): Promise<Notification[]> {
  const res = await apiClient.get<Notification[]>("/notifications/recent/")
  return res.data
}

export async function markAsRead(id: string): Promise<Notification> {
  const res = await apiClient.post<Notification>(`/notifications/${id}/mark_as_read/`)
  return res.data
}

export async function markAllAsRead(): Promise<{ updated: number }> {
  const res = await apiClient.post<{ updated: number }>("/notifications/mark_all_as_read/")
  return res.data
}

export async function clearAllNotifications(): Promise<{ deleted: number }> {
  const res = await apiClient.delete<{ deleted: number }>("/notifications/clear_all/")
  return res.data
}
