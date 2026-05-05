import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"
import { cn } from "@/utils/cn"

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p>
}

export const InputField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <label className="block">
      <span className="label">{label}</span>
      <input ref={ref} className={cn("field mt-2", error && "border-destructive focus:border-destructive focus:ring-destructive/10", className)} {...props} />
      <FieldError message={error} />
    </label>
  ),
)

InputField.displayName = "InputField"

export const SelectField = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }>(
  ({ label, error, className, children, ...props }, ref) => (
    <label className="block">
      <span className="label">{label}</span>
      <select ref={ref} className={cn("field mt-2", error && "border-destructive focus:border-destructive focus:ring-destructive/10", className)} {...props}>
        {children}
      </select>
      <FieldError message={error} />
    </label>
  ),
)

SelectField.displayName = "SelectField"

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <label className="block">
      <span className="label">{label}</span>
      <textarea ref={ref} className={cn("field mt-2 min-h-28 py-3", error && "border-destructive focus:border-destructive focus:ring-destructive/10", className)} {...props} />
      <FieldError message={error} />
    </label>
  ),
)

TextareaField.displayName = "TextareaField"
