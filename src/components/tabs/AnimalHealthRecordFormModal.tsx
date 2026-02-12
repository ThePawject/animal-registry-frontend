import React from 'react'
import { Calendar, FileText, XIcon } from 'lucide-react'
import { useForm, useStore } from '@tanstack/react-form'
import { Textarea } from '../ui/textarea'
import type { AnimalHealthRecord } from '@/api/animals/types'
import {
  useAddAnimalHealthRecord,
  useEditAnimalHealthRecord,
} from '@/api/animals/queries'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { genericErrorMessage } from '@/lib/utils'

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

const defaultHealthRecordFormData: Omit<AnimalHealthRecord, 'id'> = {
  occurredOn: new Date().toISOString().split('T')[0],
  description: '',
  performedBy: '',
}

interface AnimalHealthRecordFormModalProps {
  open: boolean
  onClose: () => void
  animalId: string
  record?: AnimalHealthRecord | null
}

export default function AnimalHealthRecordFormModal({
  open,
  onClose,
  animalId,
  record,
}: AnimalHealthRecordFormModalProps) {
  const isEdit = !!record
  const {
    mutateAsync: addRecord,
    isPending: isAdding,
    error: addError,
  } = useAddAnimalHealthRecord()
  const {
    mutateAsync: editRecord,
    isPending: isEditing,
    error: editError,
  } = useEditAnimalHealthRecord()
  const isPending = isAdding || isEditing

  const form = useForm({
    defaultValues: record
      ? {
          occurredOn: record.occurredOn.split('T')[0],
          description: record.description,
        }
      : defaultHealthRecordFormData,
    onSubmit: async ({ value }) => {
      const recordData: AnimalHealthRecord = {
        id: record?.id || '',
        occurredOn: value.occurredOn,
        description: value.description,
      }

      if (isEdit) {
        await editRecord({
          animalId,
          recordId: record.id,
          data: recordData,
        })
      } else {
        await addRecord({ animalId, data: recordData })
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
              onClick={onClose}
              className="absolute z-20 top-4 right-4 rounded-full focus:ring-2 focus:ring-ring focus:outline-none bg-red-600 hover:bg-red-700 p-2 shadow-md"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5 text-white" />
            </button>
          </DialogClose>

          <Card className="overflow-hidden py-0 gap-0">
            <div className="flex-1 p-4 shadow-md">
              <h2 className="text-2xl font-semibold">
                {isEdit ? 'Edytuj kartę zdrowia' : 'Dodaj kartę zdrowia'}
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
                name="occurredOn"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Data jest wymagana'
                    const recordDate = new Date(value)
                    const today = new Date()
                    if (recordDate > today)
                      return 'Data nie może być z przyszłości'
                    return undefined
                  },
                }}
                children={(field) => {
                  return (
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
                      : 'Dodaj kartę zdrowia'}
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
