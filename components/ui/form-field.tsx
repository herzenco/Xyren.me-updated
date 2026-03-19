import * as React from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
  helperText?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, helperText, children, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
      {label && (
        <label className="text-sm font-semibold text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  )
)

FormField.displayName = "FormField"

export { FormField }
