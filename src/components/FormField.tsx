import { Label } from './ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  error?: string
  className?: string
}
export function FormField({
  icon: Icon,
  label,
  children,
  error,
  className,
}: FormFieldProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors mb-0 w-full',
      )}
    >
      <div className="flex-shrink-0 mt-2">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <Label htmlFor={label} className="text-sm">
          {label}
        </Label>
        <div className={className}>{children}</div>
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      </div>
    </div>
  )
}
