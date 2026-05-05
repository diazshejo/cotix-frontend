import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface StateBlockProps {
  title: string
  description: string
  action?: string
  onAction?: () => void
}

export function LoadingState({ title = "Cargando datos" }: { title?: string }) {
  return (
    <div className="surface flex min-h-[260px] flex-col items-center justify-center rounded-lg p-8 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">Preparando la informacion del workspace.</p>
    </div>
  )
}

export function ErrorState({ title, description, action = "Reintentar", onAction }: StateBlockProps) {
  return (
    <div className="surface flex min-h-[260px] flex-col items-center justify-center rounded-lg p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-rose-100 text-rose-700">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {onAction ? (
        <Button className="mt-5" variant="secondary" onClick={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  )
}
