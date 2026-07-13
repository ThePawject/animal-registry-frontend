import React from 'react'
import { Calendar, LucideLoaderCircle, XIcon } from 'lucide-react'
import { createAndDownloadReport } from '../AnimalTable'
import type { EventReportParams, EventReportPeriod } from '@/api/reports/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReports } from '@/api/reports/queries'
import { genericErrorMessage } from '@/lib/utils'

type PeriodOption = {
  value: EventReportPeriod
  label: string
  description: string
}

const PERIOD_OPTIONS: Array<PeriodOption> = [
  {
    value: 'Week',
    label: 'Ostatni tydzień',
    description: 'Zdarzenia z ostatnich 7 dni.',
  },
  {
    value: 'Month',
    label: 'Ostatni miesiąc',
    description: 'Zdarzenia z ostatnich 30 dni.',
  },
  {
    value: 'Quarter',
    label: 'Ostatni kwartał',
    description: 'Zdarzenia z ostatnich 90 dni.',
  },
  {
    value: 'Custom',
    label: 'Własny zakres dat',
    description: 'Zdarzenia z wybranego przedziału.',
  },
]

interface EventReportModalProps {
  open: boolean
  onClose: () => void
}

export default function EventReportModal({
  open,
  onClose,
}: EventReportModalProps) {
  const [selectedPeriods, setSelectedPeriods] = React.useState<
    Array<EventReportPeriod>
  >(['Week', 'Month', 'Quarter'])
  const [customStartDate, setCustomStartDate] = React.useState('')
  const [customEndDate, setCustomEndDate] = React.useState('')
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  )

  const resetForm = () => {
    setSelectedPeriods(['Week', 'Month', 'Quarter'])
    setCustomStartDate('')
    setCustomEndDate('')
    setValidationError(null)
  }

  const {
    mutate: getReports,
    isPending,
    error,
  } = useReports(({ blob, filename }) => {
    createAndDownloadReport(blob, filename)
    resetForm()
    onClose()
  })

  const handleOpenChange = (openState: boolean) => {
    if (!openState) {
      resetForm()
      onClose()
    }
  }

  const togglePeriod = (period: EventReportPeriod, checked: boolean) => {
    setValidationError(null)
    if (period === 'Custom' && !checked) {
      setCustomStartDate('')
      setCustomEndDate('')
    }

    setSelectedPeriods((current) => {
      if (checked) {
        return current.includes(period) ? current : [...current, period]
      }

      return current.filter((selected) => selected !== period)
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (selectedPeriods.length === 0) {
      setValidationError('Wybierz przynajmniej jeden okres raportu.')
      return
    }

    const includesCustom = selectedPeriods.includes('Custom')
    if (includesCustom && (!customStartDate || !customEndDate)) {
      setValidationError(
        'Wybierz datę początkową i końcową dla własnego zakresu.',
      )
      return
    }

    if (includesCustom && customStartDate > customEndDate) {
      setValidationError('Data początkowa nie może być późniejsza niż końcowa.')
      return
    }

    const params: EventReportParams = {
      periods: selectedPeriods,
      customStartDate: includesCustom ? customStartDate : undefined,
      customEndDate: includesCustom ? customEndDate : undefined,
    }

    getReports(params)
  }

  const includesCustom = selectedPeriods.includes('Custom')

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-lg"
      >
        <div className="relative">
          <DialogClose asChild>
            <button
              onClick={onClose}
              className="absolute z-20 top-4 right-4 rounded-full focus:ring-2 focus:ring-ring focus:outline-none bg-red-600 hover:bg-red-700 p-2 shadow-md"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5 text-white" />
            </button>
          </DialogClose>

          <Card className="overflow-hidden py-0 gap-0">
            <div className="flex-1 p-4 shadow-md">
              <DialogTitle className="text-2xl font-semibold">
                Raport zdarzeń
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Wybierz okresy, które mają znaleźć się w raporcie PDF.
              </DialogDescription>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-3">
                {PERIOD_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedPeriods.includes(option.value)}
                      onCheckedChange={(checked) =>
                        togglePeriod(option.value, checked === true)
                      }
                      aria-label={option.label}
                    />
                    <div className="space-y-1 leading-none flex-1">
                      <span className="block text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {option.description}
                      </span>

                      {option.value === 'Custom' && includesCustom && (
                        <div className="mt-4 rounded-lg bg-muted/20 p-4 space-y-4">
                          <div className="flex items-center gap-2 font-medium">
                            <Calendar className="size-5" /> Zakres własny
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="event-report-start-date">
                                Data początkowa
                              </Label>
                              <Input
                                id="event-report-start-date"
                                type="date"
                                value={customStartDate}
                                onChange={(event) => {
                                  setValidationError(null)
                                  setCustomStartDate(event.target.value)
                                }}
                                className="bg-background"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="event-report-end-date">
                                Data końcowa
                              </Label>
                              <Input
                                id="event-report-end-date"
                                type="date"
                                value={customEndDate}
                                onChange={(event) => {
                                  setValidationError(null)
                                  setCustomEndDate(event.target.value)
                                }}
                                className="bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(validationError || error) && (
                <p className="text-sm text-red-500 font-medium">
                  {validationError ?? genericErrorMessage}
                </p>
              )}

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
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <LucideLoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                      Generowanie...
                    </>
                  ) : (
                    'Generuj raport'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
