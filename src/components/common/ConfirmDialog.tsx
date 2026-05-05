import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/Button"

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: "default" | "danger"
}

interface ConfirmState extends ConfirmOptions {
  resolve: (confirmed: boolean) => void
}

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null)

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => setState({ ...options, resolve }))
  }, [])

  const value = useMemo(() => confirm, [confirm])

  function close(confirmed: boolean) {
    state?.resolve(confirmed)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {state ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <section
            aria-modal="true"
            role="dialog"
            aria-labelledby="confirm-title"
            className="surface w-full max-w-md rounded-lg bg-white p-5"
          >
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 id="confirm-title" className="text-lg font-bold">{state.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.description}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => close(false)}>
                {state.cancelLabel ?? "Cancelar"}
              </Button>
              <Button variant={state.tone === "danger" ? "danger" : "primary"} onClick={() => close(true)}>
                {state.confirmLabel ?? "Confirmar"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error("useConfirm debe usarse dentro de ConfirmProvider.")
  return context
}
