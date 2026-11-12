export type NotificationType = "quote_accepted" | "quote_rejected" | "quote_changes_requested" | "quote_viewed" | "quote_sent"

export interface Notification {
  id: string
  notification_type: NotificationType
  title: string
  message: string
  is_read: boolean
  read_at: string | null
  created_at: string
  quote_id: string | null
  quote_number: string | null
}

export interface UnreadCountResponse {
  unread_count: number
}
