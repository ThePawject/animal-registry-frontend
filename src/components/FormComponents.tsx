import { useStore } from '@tanstack/react-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import * as ShadcnSelect from '@/components/ui/select'
import { Slider as ShadcnSlider } from '@/components/ui/slider'
import { Switch as ShadcnSwitch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useFieldContext, useFormContext } from '@/hooks/FormContext'

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="text-red-500 mt-1 font-bold"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function TextField({
  label,
  placeholder,
  icon: Icon,
}: {
  label: string
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg transition-colors">
      {Icon && (
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <Label htmlFor={label} className="text-sm text-muted-foreground">
          {label}
        </Label>
        <Input
          id={label}
          value={field.state.value}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className="mt-1 border-0 bg-transparent p-0 text-base font-medium text-foreground shadow-none focus-visible:ring-0"
        />
        {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
      </div>
    </div>
  )
}

export function TextArea({
  label,
  rows = 3,
}: {
  label: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnTextarea
        id={label}
        value={field.state.value}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Select({
  label,
  values,
  placeholder,
  icon: Icon,
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div className="flex items-start gap-3 p-3 rounded-gg transition-colors">
      {Icon && (
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <ShadcnSelect.Select
          name={field.name}
          value={field.state.value}
          onValueChange={(value) => field.handleChange(value)}
        >
          <ShadcnSelect.SelectTrigger className="w-full border-0 bg-transparent p-0 text-base font-medium text-foreground shadow-none focus:ring-0">
            <ShadcnSelect.SelectValue placeholder={placeholder} />
          </ShadcnSelect.SelectTrigger>
          <ShadcnSelect.SelectContent>
            <ShadcnSelect.SelectGroup>
              {values.map((value) => (
                <ShadcnSelect.SelectItem key={value.value} value={value.value}>
                  {value.label}
                </ShadcnSelect.SelectItem>
              ))}
            </ShadcnSelect.SelectGroup>
          </ShadcnSelect.SelectContent>
        </ShadcnSelect.Select>
        {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
      </div>
    </div>
  )
}

export function Slider({ label }: { label: string }) {
  const field = useFieldContext<number>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <Label htmlFor={label} className="mb-2 text-xl font-bold">
        {label}
      </Label>
      <ShadcnSlider
        id={label}
        onBlur={field.handleBlur}
        value={[field.state.value]}
        onValueChange={(value) => field.handleChange(value[0])}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Switch({ label }: { label: string }) {
  const field = useFieldContext<boolean>()
  const errors = useStore(field.store, (state) => state.meta.errors)

  return (
    <div>
      <div className="flex items-center gap-2">
        <ShadcnSwitch
          id={label}
          onBlur={field.handleBlur}
          checked={field.state.value}
          onCheckedChange={(checked) => field.handleChange(checked)}
        />
        <Label htmlFor={label}>{label}</Label>
      </div>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
