import React from 'react'
import { Calendar, FileText, XIcon } from 'lucide-react'
import { useForm, useStore } from '@tanstack/react-form'
import { Textarea } from '../ui/textarea'
import type { AnimalEvent, AnimalEventType } from '@/api/animals/types'
import { ANIMAL_EVENT_TYPE_MAP } from '@/api/animals/types'
import { useAddAnimalEvent, useEditAnimalEvent } from '@/api/animals/queries'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { genericErrorMessage } from '@/lib/utils'

const EVENT_TYPE_OPTIONS = Object.entries(ANIMAL_EVENT_TYPE_MAP).map(
  ([value, label]) => ({
    value: Number(value) as AnimalEventType,
    label,
  }),
)

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

const defaultEventFormData: Omit<AnimalEvent, 'id'> = {
  type: 1,
  occurredOn: new Date().toISOString().split('T')[0],
  description: '',
}

interface AnimalEventFormModalProps {
  open: boolean
  onClose: () => void
  animalId: string
  event?: AnimalEvent | null
}

export default function AnimalEventFormModal({
  open,
  onClose,
  animalId,
  event,
}: AnimalEventFormModalProps) {
  const isEdit = !!event
  const {
    mutateAsync: addEvent,
    isPending: isAdding,
    error: addError,
  } = useAddAnimalEvent()
  const {
    mutateAsync: editEvent,
    isPending: isEditing,
    error: editError,
  } = useEditAnimalEvent()
  const isPending = isAdding || isEditing

  const form = useForm({
    defaultValues: event
      ? {
          type: event.type,
          occurredOn: event.occurredOn.split('T')[0],
          description: event.description,
        }
      : defaultEventFormData,
    onSubmit: async ({ value }) => {
      const eventData: AnimalEvent = {
        id: event?.id || '',
        type: value.type,
        occurredOn: value.occurredOn,
        description: value.description,
      }

      if (isEdit) {
        await editEvent({
          animalId,
          eventId: event.id,
          data: eventData,
        })
      } else {
        await addEvent({ animalId, data: eventData })
      }

      form.reset()
      onClose()
    },
  })

  const isDirty = useStore(form.store, (state) => !state.isPristine)

  const handleOpenChange = (openState: boolean) => {
    if (!openState && isDirty) {
      const confirmed = window.confirm(
        'Masz niezapisane zmiany. Czy na pewno chcesz zamknąć okno? Zmiany zostaną utracone.',
      )
      if (!confirmed) return
    }
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
              <h2 className="text-2xl font-semibold">
                {isEdit ? 'Edytuj wydarzenie' : 'Dodaj wydarzenie'}
              </h2>
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
                name="type"
                validators={{
                  onChange: ({ value }) => {
                    return value === 0
                      ? 'Typ wydarzenia jest wymagany'
                      : undefined
                  },
                }}
                children={(field) => {
                  return (
                    <FormField
                      icon={FileText}
                      label="Typ wydarzenia"
                      error={field.state.meta.errors[0]}
                    >
                      <Select
                        value={String(field.state.value)}
                        onValueChange={(value) =>
                          field.handleChange(Number(value) as AnimalEventType)
                        }
                      >
                        <SelectTrigger className="bg-background w-full">
                          <SelectValue placeholder="Wybierz typ wydarzenia" />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPE_OPTIONS.filter(
                            (opt) => opt.value !== 0,
                          ).map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={String(opt.value)}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  )
                }}
              />

              <form.Field
                name="occurredOn"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Data wydarzenia jest wymagana'
                    const eventDate = new Date(value)
                    const today = new Date()
                    if (eventDate > today)
                      return 'Data wydarzenia nie może być z przyszłości'
                    return undefined
                  },
                }}
                children={(field) => {
                  return (
                    <FormField
                      icon={Calendar}
                      label="Data wydarzenia"
                      error={field.state.meta.errors[0]}
                    >
                      <Input
                        type="date"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        id="Data wydarzenia"
                        className="bg-background"
                      />
                    </FormField>
                  )
                }}
              />

              <form.Field
                name="description"
                validators={{
                  onChange: ({ value }) => {
                    return !value || value.trim().length < 1
                      ? 'Opis jest wymagany'
                      : undefined
                  },
                }}
                children={(field) => {
                  return (
                    <FormField
                      icon={FileText}
                      label="Opis"
                      error={field.state.meta.errors[0]}
                    >
                      <Textarea
                        maxLength={500}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        id="Opis"
                        className="bg-background wrap-anywhere"
                        placeholder="Wpisz opis"
                      />
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
                  disabled={isPending}
                >
                  {isPending
                    ? 'Zapisywanie...'
                    : isEdit
                      ? 'Zapisz zmiany'
                      : 'Dodaj wydarzenie'}
                </Button>
              </div>
              {(addError || editError) && (
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
