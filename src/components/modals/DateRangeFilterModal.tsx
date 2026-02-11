import React from 'react'
import { Calendar, XIcon } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { createAndDownloadReport } from '../AnimalTable'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useReportsByDateRange } from '@/api/reports/queries'
import { genericErrorMessage } from '@/lib/utils'

const SPECIES_OPTIONS = [
  { value: 1, label: 'Psy' },
  { value: 2, label: 'Koty' },
]

interface FormFieldProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  error?: string
}

function FormField({ icon: Icon, label, children, error }: FormFieldProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg transition-colors mb-0">
      <div className="flex-shrink-0 mt-2">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <Label htmlFor={label} className="text-sm">
          {label}
        </Label>
        {children}
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      </div>
    </div>
  )
}

interface DateRangeFilterModalProps {
  open: boolean
  onClose: () => void
}

const defaultFormData = {
  startDate: '',
  endDate: '',
  species: [] as Array<number>,
}

export default function DateRangeFilterModal({
  open,
  onClose,
}: DateRangeFilterModalProps) {
  const { mutate: getReportsByDateRange, error } = useReportsByDateRange(
    ({ blob, filename }) => {
      createAndDownloadReport(blob, filename)
      form.reset()
      onClose()
    },
  )
  const form = useForm({
    defaultValues: defaultFormData,
    onSubmit: async ({ value }) => {
      const data: ReportDateRangeParams = {
        startDate: value.startDate,
        endDate: value.endDate,
        species:
          value.species.length === 1
            ? [value.species[0] as 1 | 2]
            : ([1, 2] as [1, 2]),
      }
      getReportsByDateRange(data)
    },
  })

  const handleOpenChange = (openState: boolean) => {
    if (!openState) {
      form.reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-lg"
      >
        <div className="relative">
          <DialogClose asChild>
            <button
              onClick={() => {
                onClose()
              }}
              className="absolute z-20 top-4 right-4 rounded-full focus:ring-2 focus:ring-ring focus:outline-none bg-red-600 hover:bg-red-700 p-2 shadow-md"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5 text-white" />
            </button>
          </DialogClose>

          <Card className="overflow-hidden py-0 gap-0">
            <div className="flex-1 p-4 shadow-md">
              <h2 className="text-2xl font-semibold">Filtruj raport</h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="p-6 space-y-4"
            >
              <form.Field
                name="startDate"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Data początkowa jest wymagana'
                    return undefined
                  },
                }}
                children={(field) => {
                  return (
                    <FormField
                      icon={Calendar}
                      label="Data początkowa"
                      error={field.state.meta.errors[0]}
                    >
                      <Input
                        type="date"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        id="Data początkowa"
                        className="bg-background"
                      />
                    </FormField>
                  )
                }}
              />

              <form.Field
                name="endDate"
                validators={{
                  onChange: ({ value, fieldApi }) => {
                    if (!value) return 'Data końcowa jest wymagana'
                    const startDate = fieldApi.form.getFieldValue('startDate')
                    if (startDate && value <= startDate) {
                      return 'Data końcowa musi być późniejsza niż data początkowa'
                    }
                    return undefined
                  },
                }}
                children={(field) => {
                  return (
                    <FormField
                      icon={Calendar}
                      label="Data końcowa"
                      error={field.state.meta.errors[0]}
                    >
                      <Input
                        type="date"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        id="Data końcowa"
                        className="bg-background"
                      />
                    </FormField>
                  )
                }}
              />

              <form.Field
                name="species"
                validators={{
                  onChange: ({ value }) => {
                    if (value.length === 0) {
                      return 'Wybierz co najmniej jeden gatunek'
                    }
                    return undefined
                  },
                }}
                children={(field) => {
                  return (
                    <div className="flex items-start gap-3 p-3 rounded-lg transition-colors mb-0">
                      <div className="flex-1 min-w-0 space-y-1">
                        <Label className="text-sm">Gatunek</Label>
                        <div className="flex gap-6 pt-2">
                          {SPECIES_OPTIONS.map((option) => (
                            <div
                              key={option.value}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                id={`species-${option.value}`}
                                checked={field.state.value.includes(
                                  option.value,
                                )}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.state.value
                                  if (checked) {
                                    field.handleChange([
                                      ...currentValue,
                                      option.value,
                                    ])
                                  } else {
                                    field.handleChange(
                                      currentValue.filter(
                                        (v) => v !== option.value,
                                      ),
                                    )
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`species-${option.value}`}
                                className="text-sm cursor-pointer"
                              >
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {field.state.meta.errors[0] && (
                          <p className="text-sm text-red-500 font-medium">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                }}
              />

              <div className="flex gap-4 pt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 text-lg font-semibold h-12"
                    onClick={onClose}
                  >
                    Anuluj
                  </Button>
                </DialogClose>

                <Button
                  type="submit"
                  className="flex-1 h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Generuj raport
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 font-medium p-4">
                  {genericErrorMessage}
                </p>
              )}
            </form>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
