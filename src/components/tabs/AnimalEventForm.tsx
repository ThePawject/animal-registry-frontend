import { Calendar, FileText } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { Textarea } from '../ui/textarea'
import { FormField } from '../FormField'
import type { AnimalEvent, AnimalEventType } from '@/api/animals/types'
import { EVENT_TYPE_OPTIONS } from '@/api/animals/types'
import { useAddAnimalEvent } from '@/api/animals/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { genericErrorMessage } from '@/lib/utils'

const defaultEventFormData: Omit<AnimalEvent, 'id'> = {
  type: 0,
  occurredOn: new Date().toISOString().split('T')[0],
  description: '',
}

interface AnimalEventFormProps {
  animalId: string
  onClose: () => void
}

export default function AnimalEventForm({
  animalId,
  onClose,
}: AnimalEventFormProps) {
  const { mutateAsync: addEvent, isPending, error } = useAddAnimalEvent()

  const form = useForm({
    defaultValues: defaultEventFormData,
    onSubmit: async ({ value }) => {
      const eventData: Omit<AnimalEvent, 'id'> = {
        type: value.type,
        occurredOn: value.occurredOn,
        description: value.description,
      }

      await addEvent({ animalId, data: eventData as AnimalEvent })
      onClose()
      form.reset()
    },
  })

  const handleCancel = () => {
    form.reset()
    onClose()
  }

  return (
    <div className="overflow-hidden py-0 gap-0 rounded-md border">
      <div className="flex-1 p-3 bg-muted/50 border-b">
        <h2 className="text-xl font-semibold h-10 flex items-center">
          Dodaj wydarzenie
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
        <div className="flex gap-4 items-center">
          <form.Field
            name="type"
            validators={{
              onChange: ({ value }) => {
                return value === 0 ? 'Typ wydarzenia jest wymagany' : undefined
              },
            }}
            children={(field) => {
              return (
                <div className="flex-1">
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
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
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
                <div className="flex-1">
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
                </div>
              )
            }}
          />
        </div>

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
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-lg font-semibold h-12"
            onClick={handleCancel}
          >
            Anuluj
          </Button>

          <Button
            type="submit"
            className="flex-1 h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isPending}
          >
            {isPending ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500 font-medium p-4">
            {genericErrorMessage}
          </p>
        )}
      </form>
    </div>
  )
}
