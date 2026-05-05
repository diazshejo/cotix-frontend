import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, action, onAction }: EmptyStateProps) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-white/70 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {action && onAction ? <Button className="mt-5" onClick={onAction}>{action}</Button> : null}
    </div>
  )
}
