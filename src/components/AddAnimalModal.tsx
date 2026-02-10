import React from 'react'
import { Calendar, Dog, Hash, Tag, User, XIcon } from 'lucide-react'
import { useForm, useStore } from '@tanstack/react-form'
import type { AddAnimal, Sexes, Species } from '@/api/animals/types'
import { SEX_MAP, SPECIES_MAP } from '@/api/animals/types'
import { useAddAnimal } from '@/api/animals/queries'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn, genericErrorMessage } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ImgFile {
  file: File
  url: string
}

const SPECIES_OPTIONS = Object.entries(SPECIES_MAP).map(([value, label]) => ({
  value,
  label,
}))

const SEX_OPTIONS = Object.entries(SEX_MAP).map(([value, label]) => ({
  value,
  label,
}))

const defaultAnimalFormData: AddAnimal = {
  birthDate: '',
  color: '',
  mainPhotoIndex: 0,
  name: '',
  photos: [],
  sex: 0,
  signature: '',
  species: 0,
  transponderCode: '',
}

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

export default function AddAnimalModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { mutateAsync, isPending, error } = useAddAnimal()

  const form = useForm({
    defaultValues: defaultAnimalFormData,
    onSubmit: async ({ value }) => {
      await mutateAsync(value)
      onClose()
    },
    // validators: {
    //   onChange({ value }) {
    //     if (!value.name) return { name: 'Imię jest wymagane' }
    //     if (!value.signature) return { signature: 'Oznaczenie jest wymagane' }
    //     if (!value.transponderCode)
    //       return { transponderCode: 'Numer chipa jest wymagany' }
    //     if (!value.birthDate)
    //       return { birthDate: 'Data urodzenia jest wymagana' }
    //     return {}
    //   },
    // },
  })

  const isDirty = useStore(form.store, (state) => state.isDirty)
  const [images, setImages] = React.useState<Array<ImgFile>>([])
  const [mainImageId, setMainImageId] = React.useState(0)
  const hasImages = images.length > 0

  const uploadInputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newImgs: Array<ImgFile> = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImgs])
    if (images.length === 0 && newImgs.length > 0) setMainImageId(0)
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImages((imgs) => {
      const imgsCopy = imgs.slice()
      URL.revokeObjectURL(imgsCopy[idx].url)
      imgsCopy.splice(idx, 1)
      if (mainImageId >= imgsCopy.length)
        setMainImageId(Math.max(0, imgsCopy.length - 1))
      return imgsCopy
    })
  }

  const handleOpenChange = (openState: boolean) => {
    if (!openState && (isDirty || hasImages)) {
      const confirmed = window.confirm(
        'Masz niezapisane zmiany. Czy na pewno chcesz zamknąć okno? Zmiany zostaną utracone.',
      )
      if (!confirmed) return
    }
    if (!openState) onClose()
  }

  const handleCancel = () => {
    if (isDirty || hasImages) {
      const confirmed = window.confirm(
        'Masz niezapisane zmiany. Czy na pewno chcesz zamknąć okno? Zmiany zostaną utracone.',
      )
      if (!confirmed) return
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-6xl max-h-[95vh] overflow-y-auto"
      >
        <div className="relative">
          <DialogClose asChild>
            <button
              onClick={handleCancel}
              className="absolute z-20 top-4 right-4 rounded-full focus:ring-2 focus:ring-ring focus:outline-none bg-red-600 hover:bg-red-700 p-2 shadow-md"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5 text-white" />
            </button>
          </DialogClose>

          <Card className="overflow-hidden py-0 gap-0">
            <div className="flex-1 p-4 shadow-md">
              <h2 className="text-2xl font-semibold">Dodaj zwierzaka</h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto max-h-[700px] px-6">
                <div className="space-y-6 py-6">
                  <form.Field
                    name="name"
                    validators={{
                      onChange: ({ value }) => {
                        return !value || value.trim().length < 2
                          ? 'Imię musi mieć conajmniej 2 znaki'
                          : undefined
                      },
                    }}
                    children={(field) => {
                      return (
                        <FormField
                          icon={Dog}
                          label="Imię"
                          error={field.state.meta.errors.join(', ')}
                        >
                          <Input
                            id="Imię"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="bg-background"
                            placeholder="Wpisz imię zwierzaka"
                          />
                        </FormField>
                      )
                    }}
                  />
                  <form.Field
                    name="signature"
                    validators={{
                      onChange: ({ value }) => {
                        return !value ? 'Oznaczenie jest wymagane' : undefined
                      },
                    }}
                    children={(field) => {
                      return (
                        <FormField
                          icon={Tag}
                          label="Oznaczenie"
                          error={field.state.meta.errors[0]}
                        >
                          <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            id="Oznaczenie"
                            className="bg-background"
                            placeholder="Wpisz oznaczenie"
                          />
                        </FormField>
                      )
                    }}
                  />

                  <form.Field
                    name="transponderCode"
                    validators={{
                      onChange: ({ value }) => {
                        return !value ? 'Numer chipa jest wymagany' : undefined
                      },
                    }}
                    children={(field) => {
                      return (
                        <FormField
                          icon={Hash}
                          label="Numer chipa"
                          error={field.state.meta.errors[0]}
                        >
                          <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            id="Numer chipa"
                            className="bg-background"
                            placeholder="Wpisz numer chipa"
                          />
                        </FormField>
                      )
                    }}
                  />

                  <form.Field
                    name="species"
                    validators={{
                      onChange: ({ value }) => {
                        return value === 0 ? 'Gatunek jest wymagany' : undefined
                      },
                    }}
                    children={(field) => {
                      return (
                        <FormField
                          icon={Dog}
                          label="Gatunek"
                          error={field.state.meta.errors[0]}
                        >
                          <Select
                            value={String(field.state.value)}
                            onValueChange={(value) =>
                              field.handleChange(Number(value) as Species)
                            }
                          >
                            <SelectTrigger className="bg-background w-full">
                              <SelectValue placeholder="Wybierz gatunek" />
                            </SelectTrigger>
                            <SelectContent>
                              {SPECIES_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
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
                    name="sex"
                    validators={{
                      onChange: ({ value }) => {
                        return value === 0 ? 'Płeć jest wymagana' : undefined
                      },
                    }}
                    children={(field) => {
                      return (
                        <FormField
                          icon={User}
                          label="Płeć"
                          error={field.state.meta.errors[0]}
                        >
                          <Select
                            value={String(field.state.value)}
                            onValueChange={(value) =>
                              field.handleChange(Number(value) as Sexes)
                            }
                          >
                            <SelectTrigger className="bg-background w-full">
                              <SelectValue placeholder="Wybierz płeć" />
                            </SelectTrigger>
                            <SelectContent>
                              {SEX_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
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
                    name="color"
                    validators={{
                      onChange: ({ value }) => {
                        return !value ? 'Umaszczenie jest wymagane' : undefined
                      },
                    }}
                    children={(field) => {
                      return (
                        <FormField
                          icon={Tag}
                          label="Umaszczenie"
                          error={field.state.meta.errors[0]}
                        >
                          <Input
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            id="Umaszczenie"
                            className="bg-background"
                            placeholder="Wpisz umaszczenie"
                          />
                        </FormField>
                      )
                    }}
                  />

                  <form.Field
                    name="birthDate"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return 'Data urodzenia jest wymagana'
                        const birthDate = new Date(value)
                        const today = new Date()
                        if (birthDate > today)
                          return 'Data urodzenia nie może być z przyszłości'
                        return undefined
                      },
                    }}
                    children={(field) => {
                      return (
                        <FormField
                          icon={Calendar}
                          label="Data urodzenia"
                          error={field.state.meta.errors[0]}
                        >
                          <Input
                            type="date"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            id="Data urodzenia"
                            className="bg-background"
                          />
                        </FormField>
                      )
                    }}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full h-full flex flex-col items-center justify-between py-4">
                    <div className="flex gap-2 mb-4 justify-center overflow-x-auto">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMainImageId(idx)}
                          className={cn(
                            'w-16 h-16 rounded-lg border-2 flex-shrink-0 overflow-hidden transition-all',
                            mainImageId === idx
                              ? 'border-emerald-600 shadow-lg'
                              : 'border-muted hover:border-muted-foreground',
                          )}
                          type="button"
                        >
                          <img
                            src={img.url}
                            alt={`Miniatura ${idx + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </button>
                      ))}
                    </div>

                    {images.length > 0 ? (
                      <div className="relative flex flex-col gap-2 justify-center">
                        <div className="flex gap-2 items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Główne zdjęcie (kliknij miniaturę, aby zmienić)
                          </p>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(mainImageId)}
                          >
                            Usuń
                          </Button>
                        </div>
                        <img
                          src={images[mainImageId].url}
                          alt="Główne zdjęcie"
                          className="rounded-xl shadow-lg w-full max-w-sm h-auto max-h-[70vh] object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-sm aspect-square rounded-xl flex items-center justify-center bg-muted text-muted-foreground text-lg">
                        Brak zdjęcia
                      </div>
                    )}
                    <div className="w-full flex flex-col items-center gap-2">
                      {images.length > 1 && (
                        <div className="px-3 py-1 rounded-full text-sm">
                          {mainImageId + 1} / {images.length}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full max-w-sm mt-4 text-lg"
                        onClick={() => uploadInputRef.current?.click()}
                      >
                        Dodaj zdjęcia
                      </Button>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        hidden
                        ref={uploadInputRef}
                        onChange={handleUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 p-5 w-full">
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
                  {isPending ? 'Zapisywanie...' : 'Dodaj zwierzaka'}
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
