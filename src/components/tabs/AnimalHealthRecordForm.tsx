import React from 'react'
import { Calendar, File, FileText, Upload, User, X } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { Textarea } from '../ui/textarea'
import type { AnimalHealthRecord } from '@/api/animals/types'
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from '@/api/animals/types'
import { useAddAnimalHealthRecord } from '@/api/animals/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, genericErrorMessage } from '@/lib/utils'

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

type AnimalHealthRecordFormData = {
  occurredOn: string
  description: string
  performedBy: string
  document: File | null
}

const defaultHealthRecordFormData: AnimalHealthRecordFormData = {
  occurredOn: new Date().toISOString().split('T')[0],
  description: '',
  performedBy: '',
  document: null,
}

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
    defaultValues: defaultHealthRecordFormData,
    onSubmit: async ({ value }) => {
      const recordData: Omit<AnimalHealthRecord, 'id'> = {
        occurredOn: value.occurredOn,
        description: value.description,
        performedBy: value.performedBy,
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
                const recordDate = new Date(value)
                const today = new Date()
                if (recordDate > today) return 'Data nie może być z przyszłości'
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

          <form.Field
            name="performedBy"
            children={(field) => {
              return (
                <div className="flex-1">
                  <FormField
                    icon={User}
                    label="Wykonane przez"
                    error={field.state.meta.errors[0]}
                  >
                    <Input
                      type="text"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      id="Wykonane przez"
                      className="bg-background"
                      placeholder="Podaj nazwę lekarza/osoby"
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
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept={ALLOWED_DOCUMENT_EXTENSIONS}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          field.handleChange(file)
                        }
                      }}
                      className="hidden"
                    />
                    <div
                      className={cn(
                        'flex items-center justify-center w-full h-10 px-4 border-2 border-dashed rounded-lg transition-colors',
                        field.state.meta.errors.length > 0
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400',
                      )}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      <span
                        className={cn(
                          'text-sm',
                          field.state.meta.errors.length > 0
                            ? 'text-red-600'
                            : 'text-gray-500',
                        )}
                      >
                        {field.state.value
                          ? field.state.value.name
                          : 'Wybierz plik (PDF, DOC, DOCX, JPEG, PNG, WEBP - max 10MB)'}
                      </span>
                    </div>
                  </label>
                  {field.state.value && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
                      onClick={() => field.handleChange(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
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
