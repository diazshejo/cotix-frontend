import { cn } from "@/utils/cn"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export function PageSkeleton({ variant = "list" }: { variant?: "dashboard" | "list" | "form" | "integrations" }) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </section>
        <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <Skeleton className="h-[360px] w-full" />
          <Skeleton className="h-[360px] w-full" />
        </section>
      </div>
    )
  }

  if (variant === "form") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === "integrations") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}
