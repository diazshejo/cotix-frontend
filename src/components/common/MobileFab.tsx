import { Link } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/utils/cn"

interface MobileFabProps {
  icon: LucideIcon
  label: string
  to?: string
  onClick?: () => void
  disabled?: boolean
}

export function MobileFab({ icon: Icon, label, to, onClick, disabled }: MobileFabProps) {
  const className = cn(
    "focus-ring mobile-fab fixed right-4 z-30 inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_16px_40px_rgba(37,99,235,0.34)] transition hover:bg-primary/92 sm:hidden",
    disabled && "pointer-events-none opacity-50",
  )

  if (to && !disabled) {
    return (
      <Link to={to} className={className} aria-label={label}>
        <Icon className="h-5 w-5" />
        <span className="max-w-[8rem] truncate">{label}</span>
      </Link>
    )
  }

  return (
    <button type="button" className={className} aria-label={label} onClick={onClick} disabled={disabled}>
      <Icon className="h-5 w-5" />
      <span className="max-w-[8rem] truncate">{label}</span>
    </button>
  )
}
