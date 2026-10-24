import { Calendar, File, FileText } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import DocumentPicker from '../DocumentPicker'
import { FormField } from '../FormField'
import { Textarea } from '../ui/textarea'
import type { AnimalHealthRecord } from '@/api/animals/types'
import { ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE } from '@/api/animals/types'
import { useAddAnimalHealthRecord } from '@/api/animals/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { genericErrorMessage, isFutureDate, todayIsoDate } from '@/lib/utils'

type AnimalHealthRecordFormData = {
  occurredOn: string
  description: string
  document: File | null
}

const createDefaultHealthRecordFormData = (): AnimalHealthRecordFormData => ({
  occurredOn: todayIsoDate(),
  description: '',
  document: null,
})

interface AnimalHealthRecordFormProps {
  animalId: string
  onClose: () => void
}

export default function AnimalHealthRecordForm({
  animalId,
  onClose,
}: AnimalHealthRecordFormProps) {
  const {
    mutateAsync: addRecord,
    isPending,
    error,
  } = useAddAnimalHealthRecord()

  const form = useForm({
    defaultValues: createDefaultHealthRecordFormData(),
    onSubmit: async ({ value }) => {
      const recordData: Omit<AnimalHealthRecord, 'id'> = {
        occurredOn: value.occurredOn,
        description: value.description,
      }

      await addRecord({
        animalId,
        data: recordData,
        file: value.document ?? undefined,
      })
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
          Dodaj kartę zdrowia
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
            name="occurredOn"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Data jest wymagana'
                if (isFutureDate(value))
                  return 'Data nie może być z przyszłości'
                return undefined
              },
            }}
            children={(field) => {
              return (
                <div className="flex-1">
                  <FormField
                    icon={Calendar}
                    label="Data"
                    error={field.state.meta.errors[0]}
                  >
                    <Input
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      id="Data"
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

        <form.Field
          name="document"
          validators={{
            onChange: ({ value }) => {
              if (value && !ALLOWED_DOCUMENT_TYPES.includes(value.type)) {
                return 'Niedozwolony typ pliku. Dozwolone: PDF, DOC, DOCX, JPEG, PNG, WEBP'
              }
              if (value && value.size > MAX_DOCUMENT_SIZE) {
                return 'Plik jest za duży. Maksymalny rozmiar to 10MB'
              }
              return undefined
            },
          }}
          children={(field) => {
            return (
              <FormField
                icon={File}
                label="Dokument (opcjonalnie)"
                error={field.state.meta.errors[0]}
              >
                <DocumentPicker
                  fileName={field.state.value?.name ?? null}
                  hasError={field.state.meta.errors.length > 0}
                  onSelect={(file) => field.handleChange(file)}
                  onClear={() => field.handleChange(null)}
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
          <p role="alert" className="text-sm text-red-500 font-medium p-4">
            {genericErrorMessage}
          </p>
        )}
      </form>
    </div>
  )
}
