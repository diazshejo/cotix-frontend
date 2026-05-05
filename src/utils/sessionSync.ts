export const SESSION_EVENT = "cotix:session-event"

export type SessionEvent = "login" | "logout" | "expired"

let channel: BroadcastChannel | null = null

function getChannel() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return null
  channel ??= new BroadcastChannel("cotix-session")
  return channel
}

export function publishSessionEvent(event: SessionEvent) {
  getChannel()?.postMessage(event)
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_EVENT, `${event}:${Date.now()}`)
  }
}

export function subscribeSessionEvents(callback: (event: SessionEvent) => void) {
  if (typeof window === "undefined") return () => undefined

  const broadcast = getChannel()
  const onMessage = (message: MessageEvent<SessionEvent>) => callback(message.data)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SESSION_EVENT || !event.newValue) return
    const [sessionEvent] = event.newValue.split(":")
    if (sessionEvent === "login" || sessionEvent === "logout" || sessionEvent === "expired") callback(sessionEvent)
  }

  broadcast?.addEventListener("message", onMessage)
  window.addEventListener("storage", onStorage)

  return () => {
    broadcast?.removeEventListener("message", onMessage)
    window.removeEventListener("storage", onStorage)
  }
}
