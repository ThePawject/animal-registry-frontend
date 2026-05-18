import React from 'react'
import {
  Calendar,
  Dog,
  ListFilter,
  LucideLoaderCircle,
  XIcon,
} from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { createAndDownloadReport } from '../AnimalTable'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '../ui/combobox'
import type { ReportDateRangeParams } from '@/api/reports/types'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReportsByDateRange } from '@/api/reports/queries'
import { genericErrorMessage } from '@/lib/utils'
import { ANIMAL_EVENT_TYPE_MAP } from '@/api/animals/types'

const SPECIES_OPTIONS = [
  { value: 1, label: 'Psy' },
  { value: 2, label: 'Koty' },
]

const AnimalEventOptions = Object.entries(ANIMAL_EVENT_TYPE_MAP)
  .filter((event) => event[1] !== 'Brak')
  .map((event) => ({
    value: event[0],
    label: event[1],
  }))

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
  species: [] as Array<string>,
  eventTypes: [] as Array<string>,
}

export default function DateRangeFilterModal({
  open,
  onClose,
}: DateRangeFilterModalProps) {
  const {
    mutate: getReportsByDateRange,
    isPending: isDateRangePending,
    error,
  } = useReportsByDateRange(({ blob, filename }) => {
    createAndDownloadReport(blob, filename)
    form.reset()
    onClose()
  })
  const form = useForm({
    defaultValues: defaultFormData,
    onSubmit: ({ value }) => {
      const getSpecies = () => {
        if (value.species.length === 0) return [1, 2]
        return value.species.map((label) => {
          const option = SPECIES_OPTIONS.find((o) => o.label === label)!
          return option.value
        })
      }

      const data: ReportDateRangeParams = {
        startDate: value.startDate,
        endDate: value.endDate,
        eventTypes: value.eventTypes.length
          ? value.eventTypes.map(
              (label) =>
                Number(
                  AnimalEventOptions.find((o) => o.label === label)?.value,
                ) as keyof typeof ANIMAL_EVENT_TYPE_MAP,
            )
          : null,
        species: getSpecies(),
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
  const anchor = useComboboxAnchor()
  const containerRef = React.useRef<HTMLDivElement>(null)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-lg"
      >
        <div className="relative" ref={containerRef}>
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
                name="eventTypes"
                children={(field) => {
                  return (
                    <FormField
                      icon={ListFilter}
                      label="Typ zdarzenia"
                      error={field.state.meta.errors[0]}
                    >
                      <Combobox
                        multiple
                        autoHighlight
                        items={AnimalEventOptions.map((option) => option.label)}
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val)}
                      >
                        <ComboboxChips ref={anchor} className="w-full">
                          <ComboboxValue>
                            {(values) => (
                              <React.Fragment>
                                {values.map((value: string) => (
                                  <ComboboxChip key={value}>
                                    {value}
                                  </ComboboxChip>
                                ))}
                                <ComboboxChipsInput
                                  placeholder={
                                    field.state.value.length
                                      ? ''
                                      : 'Wybierz typ zdarzenia'
                                  }
                                />
                              </React.Fragment>
                            )}
                          </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent
                          anchor={anchor}
                          container={containerRef}
                          className="drop-shadow-2xl"
                        >
                          <ComboboxEmpty>Brak wyników.</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </FormField>
                  )
                }}
              />

              <form.Field
                name="species"
                children={(field) => {
                  return (
                    <FormField
                      icon={Dog}
                      label="Gatunek"
                      error={field.state.meta.errors[0]}
                    >
                      <Combobox
                        multiple
                        autoHighlight
                        items={SPECIES_OPTIONS.map((option) => option.label)}
                        value={field.state.value}
                        onValueChange={(val) => field.handleChange(val)}
                      >
                        <ComboboxChips ref={anchor} className="w-full">
                          <ComboboxValue>
                            {(values) => (
                              <React.Fragment>
                                {values.map((value: string) => (
                                  <ComboboxChip key={value}>
                                    {value}
                                  </ComboboxChip>
                                ))}
                                <ComboboxChipsInput
                                  placeholder={
                                    field.state.value.length
                                      ? ''
                                      : 'Wybierz gatunek'
                                  }
                                />
                              </React.Fragment>
                            )}
                          </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent
                          anchor={anchor}
                          container={containerRef}
                        >
                          <ComboboxEmpty>Brak wyników.</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item} value={item}>
                                {item}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </FormField>
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
                  disabled={isDateRangePending}
                >
                  {isDateRangePending ? (
                    <>
                      <LucideLoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                      Generowanie...
                    </>
                  ) : (
                    'Generuj raport'
                  )}
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
