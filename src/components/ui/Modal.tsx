import { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface ModalProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, description, children, onClose }: ModalProps) {
  if (!open) return null

  return (
    <div className="safe-top fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 px-0 py-0 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
      <section
        aria-modal="true"
        role="dialog"
        aria-labelledby="modal-title"
        className="surface flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl bg-white sm:rounded-lg"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-white px-5 py-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button variant="ghost" className="h-9 w-9 px-0" onClick={onClose} aria-label="Cerrar modal">
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div className="safe-bottom overflow-y-auto overscroll-contain p-5">{children}</div>
      </section>
    </div>
  )
}
