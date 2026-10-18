import React from 'react'
import {
  Calendar,
  ExternalLink,
  FileText,
  Hash,
  LucideLoaderCircle,
  RefreshCw,
  Stethoscope,
  Syringe,
  Upload,
} from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { FormField } from '../FormField'
import type {
  AnimalVaccination,
  VaccinationFormData,
} from '@/api/vaccinations/types'
import {
  BATCH_NUMBER_MAX_LENGTH,
  VACCINATION_NOTES_MAX_LENGTH,
  VACCINE_NAME_MAX_LENGTH,
  VETERINARIAN_MAX_LENGTH,
} from '@/api/vaccinations/types'
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from '@/api/animals/types'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSaveVaccination } from '@/api/vaccinations/queries'
import {
  formatDate,
  genericErrorMessage,
  isFutureDate,
  todayIsoDate,
} from '@/lib/utils'

const NO_REPLACEMENT = 'none'

const getDefaultFormData = (
  vaccination: AnimalVaccination | null,
  renews: AnimalVaccination | null,
): VaccinationFormData => ({
  vaccineName: vaccination?.vaccineName ?? renews?.vaccineName ?? '',
  administeredOn: vaccination
    ? vaccination.administeredOn.split('T')[0]
    : todayIsoDate(),
  validUntil: vaccination?.validUntil
    ? vaccination.validUntil.split('T')[0]
    : '',
  veterinarian: vaccination?.veterinarian ?? '',
  batchNumber: vaccination?.batchNumber ?? '',
  notes: vaccination?.notes ?? '',
  replacesVaccinationId: vaccination?.replacesVaccinationId ?? renews?.id ?? '',
})

interface VaccinationModalProps {
  open: boolean
  animalId: string
  vaccination: AnimalVaccination | null
  renews: AnimalVaccination | null
  animalVaccinations: Array<AnimalVaccination>
  onClose: () => void
}

export default function VaccinationModal({
  open,
  animalId,
  vaccination,
  renews,
  animalVaccinations,
  onClose,
}: VaccinationModalProps) {
  const { mutateAsync, isPending, error, reset } = useSaveVaccination()
  const [file, setFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [removeAttachment, setRemoveAttachment] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const existingAttachment = removeAttachment ? null : vaccination?.attachment
  const isReplacedByOther = (item: AnimalVaccination) =>
    Boolean(item.replacedByVaccinationId) &&
    item.replacedByVaccinationId !== vaccination?.id
  const replaceableVaccinations = animalVaccinations.filter(
    (item) => item.id !== vaccination?.id,
  )

  const form = useForm({
    defaultValues: getDefaultFormData(vaccination, renews),
    onSubmit: async ({ value }) => {
      await mutateAsync({
        animalId,
        vaccinationId: vaccination?.id,
        data: value,
        file: file ?? undefined,
        deleteAttachment: removeAttachment,
      })
      handleClose()
    },
  })

  const handleClose = () => {
    form.reset()
    reset()
    setFile(null)
    setFileError(null)
    setRemoveAttachment(false)
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    e.target.value = ''
    if (!selected) return

    if (!ALLOWED_DOCUMENT_TYPES.includes(selected.type)) {
      setFileError(
        'Niedozwolony typ pliku. Dozwolone: PDF, DOC, DOCX, JPEG, PNG, WEBP (max 10MB)',
      )
      return
    }
    if (selected.size > MAX_DOCUMENT_SIZE) {
      setFileError('Plik jest za duży. Maksymalny rozmiar to 10MB')
      return
    }
    setFileError(null)
    setFile(selected)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) handleClose()
      }}
    >
      <DialogContent className="p-0 bg-transparent shadow-none border-none max-w-lg">
        <Card className="overflow-hidden py-0 gap-0 max-h-[90vh] overflow-y-auto">
          <div className="flex-1 p-4 shadow-md">
            <h2 className="text-2xl font-semibold">
              {vaccination
                ? 'Edytuj szczepienie'
                : renews
                  ? 'Odnów szczepienie'
                  : 'Dodaj szczepienie'}
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
              name="vaccineName"
              validators={{
                onChange: ({ value }) => {
                  if (!value.trim()) return 'Nazwa szczepionki jest wymagana'
                  if (value.trim().length > VACCINE_NAME_MAX_LENGTH)
                    return `Nazwa szczepionki może mieć maksymalnie ${VACCINE_NAME_MAX_LENGTH} znaków`
                  return undefined
                },
              }}
              children={(field) => (
                <FormField
                  icon={Syringe}
                  label="Szczepionka"
                  error={field.state.meta.errors[0]}
                >
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id="Szczepionka"
                    className="bg-background"
                    placeholder="Wpisz nazwę szczepionki"
                  />
                </FormField>
              )}
            />

            <div className="flex gap-4">
              <form.Field
                name="administeredOn"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Data podania jest wymagana'
                    if (isFutureDate(value))
                      return 'Data podania nie może być z przyszłości'
                    return undefined
                  },
                }}
                children={(field) => (
                  <div className="flex-1">
                    <FormField
                      icon={Calendar}
                      label="Data podania"
                      error={field.state.meta.errors[0]}
                    >
                      <Input
                        type="date"
                        min="2000-01-01"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        id="Data podania"
                        className="bg-background"
                      />
                    </FormField>
                  </div>
                )}
              />

              <form.Field
                name="validUntil"
                validators={{
                  onChangeListenTo: ['administeredOn'],
                  onChange: ({ value, fieldApi }) => {
                    const administeredOn =
                      fieldApi.form.getFieldValue('administeredOn')
                    if (value && administeredOn && value < administeredOn)
                      return 'Termin ważności nie może być wcześniejszy niż data podania'
                    return undefined
                  },
                }}
                children={(field) => (
                  <div className="flex-1">
                    <FormField
                      icon={Calendar}
                      label="Ważne do"
                      error={field.state.meta.errors[0]}
                    >
                      <Input
                        type="date"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        id="Ważne do"
                        className="bg-background"
                      />
                    </FormField>
                  </div>
                )}
              />
            </div>

            <form.Field
              name="replacesVaccinationId"
              validators={{
                onChangeListenTo: ['administeredOn'],
                onChange: ({ value, fieldApi }) => {
                  const replaced = replaceableVaccinations.find(
                    (item) => item.id === value,
                  )
                  if (replaced && isReplacedByOther(replaced))
                    return 'To szczepienie zostało już zastąpione innym'
                  const administeredOn =
                    fieldApi.form.getFieldValue('administeredOn')
                  if (
                    replaced &&
                    administeredOn &&
                    replaced.administeredOn.split('T')[0] >= administeredOn
                  )
                    return 'Zastępowane szczepienie musi być wcześniejsze niż to'
                  return undefined
                },
              }}
              children={(field) => (
                <FormField
                  icon={RefreshCw}
                  label="Zastępuje szczepienie"
                  error={field.state.meta.errors[0]}
                >
                  <Select
                    value={field.state.value || NO_REPLACEMENT}
                    onValueChange={(id) =>
                      field.handleChange(id === NO_REPLACEMENT ? '' : id)
                    }
                  >
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_REPLACEMENT}>
                        Nie zastępuje żadnego
                      </SelectItem>
                      {replaceableVaccinations.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          disabled={isReplacedByOther(item)}
                        >
                          {item.vaccineName} ({formatDate(item.administeredOn)})
                          {isReplacedByOther(item) && ' – już zastąpione'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <form.Field
              name="veterinarian"
              validators={{
                onChange: ({ value }) =>
                  value.length > VETERINARIAN_MAX_LENGTH
                    ? `Lekarz weterynarii może mieć maksymalnie ${VETERINARIAN_MAX_LENGTH} znaków`
                    : undefined,
              }}
              children={(field) => (
                <FormField
                  icon={Stethoscope}
                  label="Lekarz weterynarii"
                  error={field.state.meta.errors[0]}
                >
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id="Lekarz weterynarii"
                    className="bg-background"
                  />
                </FormField>
              )}
            />

            <form.Field
              name="batchNumber"
              validators={{
                onChange: ({ value }) =>
                  value.length > BATCH_NUMBER_MAX_LENGTH
                    ? `Numer serii może mieć maksymalnie ${BATCH_NUMBER_MAX_LENGTH} znaków`
                    : undefined,
              }}
              children={(field) => (
                <FormField
                  icon={Hash}
                  label="Numer serii"
                  error={field.state.meta.errors[0]}
                >
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id="Numer serii"
                    className="bg-background"
                  />
                </FormField>
              )}
            />

            <form.Field
              name="notes"
              validators={{
                onChange: ({ value }) =>
                  value.length > VACCINATION_NOTES_MAX_LENGTH
                    ? `Notatka może mieć maksymalnie ${VACCINATION_NOTES_MAX_LENGTH} znaków`
                    : undefined,
              }}
              children={(field) => (
                <FormField
                  icon={FileText}
                  label="Notatka"
                  error={field.state.meta.errors[0]}
                >
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id="Notatka"
                    className="bg-background"
                  />
                </FormField>
              )}
            />

            <FormField
              icon={Upload}
              label="Skan dokumentu"
              error={fileError ?? undefined}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_DOCUMENT_EXTENSIONS}
                onChange={handleFileChange}
                className="hidden"
              />
              {file || existingAttachment ? (
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium flex items-center gap-1 text-gray-600">
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {file?.name ?? existingAttachment?.fileName}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Zmień plik
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      onClick={() => {
                        setFile(null)
                        setFileError(null)
                        setRemoveAttachment(true)
                      }}
                    >
                      Usuń
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload />
                  Wybierz plik
                </Button>
              )}
            </FormField>

            {error && (
              <p role="alert" className="text-sm text-red-500 font-medium">
                {genericErrorMessage}
              </p>
            )}

            <div className="flex gap-4 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-lg font-semibold h-12"
                >
                  Anuluj
                </Button>
              </DialogClose>
              <form.Subscribe
                selector={(state) => [state.canSubmit]}
                children={([canSubmit]) => (
                  <Button
                    type="submit"
                    className="flex-1 h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={!canSubmit || isPending}
                  >
                    {isPending && (
                      <LucideLoaderCircle className="animate-spin" />
                    )}
                    Zapisz
                  </Button>
                )}
              />
            </div>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
