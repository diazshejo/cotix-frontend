import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, Check, CheckCheck, Eye, MessageSquare, Trash2, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  clearAllNotifications,
  fetchRecentNotifications,
  fetchUnreadCount,
  notificationSocketUrl,
  markAllAsRead,
  markAsRead,
} from "@/api/notifications"
import { Button } from "@/components/ui/Button"
import { queryKeys } from "@/constants/queryKeys"
import { routes } from "@/constants/routes"
import type { Notification, NotificationType } from "@/types/notification"
import { cn } from "@/utils/cn"

const ICON: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  quote_accepted: { icon: <Check className="h-3.5 w-3.5" />, color: "bg-emerald-100 text-emerald-600" },
  quote_rejected: { icon: <X className="h-3.5 w-3.5" />, color: "bg-red-100 text-red-500" },
  quote_changes_requested: { icon: <MessageSquare className="h-3.5 w-3.5" />, color: "bg-violet-100 text-violet-600" },
  quote_viewed:   { icon: <Eye className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-500" },
  quote_sent:     { icon: <Bell className="h-3.5 w-3.5" />, color: "bg-slate-100 text-slate-500" },
}

function timeAgo(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es })
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [live, setLive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: unread = 0 } = useQuery({
    queryKey: queryKeys.notificationsUnread,
    queryFn: fetchUnreadCount,
    refetchInterval: live ? 120_000 : 30_000,
    refetchIntervalInBackground: false,
  })

  const { data: notifications = [], isFetching } = useQuery({
    queryKey: queryKeys.notificationsRecent,
    queryFn: fetchRecentNotifications,
    enabled: open,
    staleTime: 0,
    refetchInterval: open && !live ? 30_000 : false,
    refetchIntervalInBackground: false,
  })

  const markOneMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notificationsUnread })
      qc.invalidateQueries({ queryKey: queryKeys.notificationsRecent })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notificationsUnread })
      qc.invalidateQueries({ queryKey: queryKeys.notificationsRecent })
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notificationsUnread })
      qc.invalidateQueries({ queryKey: queryKeys.notificationsRecent })
    },
  })

  useEffect(() => {
    let socket: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let stopped = false
    let attempts = 0

    const refresh = () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notificationsUnread })
      void qc.invalidateQueries({ queryKey: queryKeys.notificationsRecent })
    }

    const connect = () => {
      if (stopped || !navigator.onLine) return
      socket = new WebSocket(notificationSocketUrl())
      socket.onopen = () => {
        attempts = 0
        setLive(true)
        refresh() // Reconcile notifications missed while disconnected.
      }
      socket.onmessage = (event) => {
        try {
          if (JSON.parse(event.data)?.type === "notification_changed") refresh()
        } catch {
          // Ignore malformed messages; REST remains authoritative.
        }
      }
      socket.onclose = (event) => {
        setLive(false)
        if (stopped) return
        if (event.code === 4401) refresh() // REST can renew an expired access cookie.
        const delay = Math.min(30_000, 1000 * 2 ** Math.min(attempts++, 5))
        retryTimer = setTimeout(connect, delay + Math.random() * 500)
      }
    }

    const onOnline = () => {
      if (retryTimer) clearTimeout(retryTimer)
      if (!socket || socket.readyState === WebSocket.CLOSED) connect()
      refresh()
    }
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh()
    }

    connect()
    window.addEventListener("online", onOnline)
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      stopped = true
      if (retryTimer) clearTimeout(retryTimer)
      socket?.close()
      window.removeEventListener("online", onOnline)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [qc])

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onOutsideClick)
    return () => document.removeEventListener("mousedown", onOutsideClick)
  }, [open])

  function handleNotificationClick(n: Notification) {
    if (!n.is_read) markOneMutation.mutate(n.id)
    setOpen(false)
    if (n.quote_id) {
      navigate(routes.quoteDetail(n.quote_id))
    }
  }

  const hasUnread = unread > 0

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={hasUnread ? `${unread} notificaciones sin leer` : "Notificaciones"}
        className={cn(
          "focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted",
          open && "bg-muted",
        )}
      >
        <Bell className="h-4 w-4" />
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold leading-none text-white ring-2 ring-background">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-[360px] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Notificaciones</span>
              {hasUnread && (
                <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                  {unread} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasUnread && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  title="Marcar todas como leídas"
                  className="focus-ring rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  title="Limpiar todas"
                  className="focus-ring rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isFetching && notifications.length === 0 ? (
              <div className="flex flex-col gap-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Sin notificaciones</p>
                <p className="text-xs text-muted-foreground/70">Te avisaremos cuando tus clientes respondan.</p>
              </div>
            ) : (
              notifications.map((n) => <NotificationItem key={n.id} n={n} onClick={handleNotificationClick} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationItem({ n, onClick }: { n: Notification; onClick: (n: Notification) => void }) {
  const { icon, color } = ICON[n.notification_type] ?? ICON.quote_sent

  return (
    <button
      onClick={() => onClick(n)}
      className={cn(
        "flex w-full gap-3 px-4 py-3 text-left transition hover:bg-muted/60",
        !n.is_read && "bg-blue-50/60",
      )}
    >
      <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", color)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm", !n.is_read ? "font-semibold text-foreground" : "text-foreground/80")}>
          {n.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
        <p className="mt-1 text-[10px] text-muted-foreground/60">{timeAgo(n.created_at)}</p>
      </div>
      {!n.is_read && (
        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </button>
  )
}
