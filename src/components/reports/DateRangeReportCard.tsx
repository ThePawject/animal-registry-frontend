import React from 'react'
import { Calendar, Dog, ListFilter } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { FormField } from '../FormField'
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
import ReportCard from './ReportCard'
import type { ReportDateRangeParams } from '@/api/reports/types'
import { Input } from '@/components/ui/input'
import { useReportsByDateRange } from '@/api/reports/queries'
import { createAndDownloadReport, genericErrorMessage } from '@/lib/utils'
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

const defaultFormData = {
  startDate: '',
  endDate: '',
  species: [] as Array<string>,
  eventTypes: [] as Array<string>,
}

export default function DateRangeReportCard() {
  const {
    mutate: getReportsByDateRange,
    isPending: isDateRangePending,
    error,
  } = useReportsByDateRange(({ blob, filename }) => {
    createAndDownloadReport(blob, filename)
    form.reset()
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

  const anchor = useComboboxAnchor()

  return (
    <ReportCard
      title="Raport zdarzeń w zakresie"
      description="Zwierzęta i zdarzenia z wybranego zakresu dat, z filtrem gatunku i typu zdarzenia."
      onSubmit={() => form.handleSubmit()}
      isPending={isDateRangePending}
      error={error ? genericErrorMessage : null}
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
                          <ComboboxChip key={value}>{value}</ComboboxChip>
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
                <ComboboxContent anchor={anchor} className="drop-shadow-2xl">
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
                          <ComboboxChip key={value}>{value}</ComboboxChip>
                        ))}
                        <ComboboxChipsInput
                          placeholder={
                            field.state.value.length ? '' : 'Wybierz gatunek'
                          }
                        />
                      </React.Fragment>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
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
    </ReportCard>
  )
}
