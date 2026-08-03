import { apiClient } from "@/api/client"
import type { Notification, UnreadCountResponse } from "@/types/notification"

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
