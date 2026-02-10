import React from 'react'
import {
  Calendar,
  Dog,
  Hash,
  LucideLoaderCircle,
  Tag,
  Trash2Icon,
  User,
  XIcon,
} from 'lucide-react'
import { useForm, useStore } from '@tanstack/react-form'
import type {
  AnimalById,
  EditAnimal,
  EditAnimalForm,
  Sexes,
  Species,
} from '@/api/animals/types'
import { SEX_MAP, SPECIES_MAP } from '@/api/animals/types'
import { useAnimalById, useEditAnimal } from '@/api/animals/queries'
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

const SPECIES_OPTIONS = Object.entries(SPECIES_MAP).map(([value, label]) => ({
  value,
  label,
}))

const SEX_OPTIONS = Object.entries(SEX_MAP).map(([value, label]) => ({
  value,
  label,
}))

interface FormFieldProps {
  icon: React.ElementType
  label: string
  children: React.ReactNode
  error?: string
}
const inputUploadAccept = '.jpg,.jpeg,.png,.webp'

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

const mapAnimalToFormData = (animal: AnimalById): EditAnimalForm => {
  const { photos, mainPhotoId, ...rest } = animal

  return {
    photos: photos,
    mainPhotoId: mainPhotoId,
    mainPhotoIndex: null,
    ...rest,
  }
}
type AnimalEditTabProps = {
  animal: AnimalById
  open: boolean
  onClose: () => void
}

type AnimalEditTabWrapperProps = {
  animalId: string
  open: boolean
  onClose: () => void
}

export function AnimalEditTabWrapper({
  animalId,
  ...props
}: AnimalEditTabWrapperProps) {
  const { data: animal, isError, isLoading } = useAnimalById(animalId)
  if (isLoading || !animal) {
    return (
      <Dialog
        open={props.open}
        onOpenChange={(o) => {
          if (!o) props.onClose()
        }}
      >
        <DialogContent
          showCloseButton={false}
          dialogOverlayClassName="bg-transparent"
          className="p-0 bg-transparent max-w-[1150px] max-h-[800px] h-full overflow-y-auto flex items-center justify-center"
        >
          <Card className="p-8 w-full h-full flex items-center justify-center">
            <LucideLoaderCircle className="w-32 h-32 text-emerald-600 animate-spin" />
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError) {
    return (
      <Dialog
        open={props.open}
        onOpenChange={(o) => {
          if (!o) props.onClose()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="p-0 bg-transparent shadow-none border-none max-w-6xl max-h-[95vh] overflow-y-auto"
        >
          <Card className="p-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-lg text-red-500">
                Wystąpił błąd podczas ładowania danych zwierzaka.
              </p>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }
  return <AnimalEditTab animal={animal} {...props} />
}

function AnimalEditTab({ animal, open, onClose }: AnimalEditTabProps) {
  const [submittedSuccessfully, setSubmittedSuccessfully] =
    React.useState(false)
  const { mutateAsync, isPending, error } = useEditAnimal(() => {
    setSubmittedSuccessfully(true)
  })
  // TODO: add error handling, show errors in UI

  const form = useForm({
    defaultValues: mapAnimalToFormData(animal),

    onSubmit: async ({ value }) => {
      const { photos, ...rest } = value

      const existingPhotosIds = photos
        .filter((p) => typeof p === 'object' && 'id' in p)
        .map((p) => p.id)
      const newPhotos = photos.filter(
        (p) => typeof p === 'object' && 'arrayBuffer' in p,
      )

      const payload: EditAnimal = {
        ...rest,
        existingPhotoIds: existingPhotosIds,
        newPhotos: newPhotos,
      }
      await mutateAsync({ animalId: value.id, data: payload })
      if (submittedSuccessfully) {
        form.reset()
      }
      onClose()
    },
  })

  const isDirty = useStore(form.store, (state) => state.isDirty)

  const uploadInputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 10) {
      alert(`Możesz dodać maksymalnie 10 zdjęć.`)
      e.target.value = ''
      return
    }
    if (!files.length) return
    form.setFieldValue('photos', [...form.getFieldValue('photos'), ...files])
    if (
      !form.getFieldValue('mainPhotoId') &&
      !form.getFieldValue('mainPhotoIndex')
    ) {
      form.setFieldValue(
        'mainPhotoIndex',
        form.getFieldValue('photos').length - files.length,
      )
    }
    e.target.value = ''
    if (displayedImageId === null) {
      setDisplayedImageId(form.getFieldValue('photos').length - files.length)
    }
  }

  const images = useStore(form.store, (state) => state.values.photos)

  const [displayedImageId, setDisplayedImageId] = React.useState<number | null>(
    images.length > 0 ? 0 : null,
  )

  const mainPhotoId = useStore(form.store, (state) => state.values.mainPhotoId)
  const mainPhotoIndex = useStore(
    form.store,
    (state) => state.values.mainPhotoIndex,
  )

  const numberOfExistingPhotos = images.filter(
    (img) => typeof img === 'object' && 'id' in img,
  ).length

  const isMainPhoto = (id: string | null, index: number) => {
    if (mainPhotoId) {
      return id === mainPhotoId
    }
    if (mainPhotoIndex !== null) {
      return index === mainPhotoIndex
    }
    return false
  }

  const getDisplayedImageUrl = () => {
    if (displayedImageId === null) return null
    const image = images[displayedImageId]
    if (typeof image === 'object' && 'id' in image) {
      return image.url
    }
    if (typeof image === 'object' && 'arrayBuffer' in image) {
      return URL.createObjectURL(image)
    }
  }

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
        className="p-0 bg-transparent shadow-none border-none max-w-6xl max-h-[95vh] overflow-y-auto"
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
              <h2 className="text-2xl font-semibold">Edytuj: {animal.name}</h2>
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
                    children={(field) => {
                      return (
                        <FormField
                          icon={Dog}
                          label="Imię"
                          error={field.state.meta.errors[0]}
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
                              <SelectValue placeholder="Wybierz gatunek" />
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
                    <div className="flex gap-2 mb-4 overflow-x-auto max-w-[535px]">
                      {form.getFieldValue('photos').map((img, idx) => {
                        const isFile =
                          img instanceof File && 'arrayBuffer' in img

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setDisplayedImageId(idx)
                              return
                            }}
                            className={cn(
                              'relative w-16 h-16 outline-2 -outline-offset-2 rounded-md min-w-16',
                              idx === displayedImageId
                                ? 'outline-emerald-600 shadow-lg'
                                : 'outline-muted hover:outline-muted-foreground',
                            )}
                            type="button"
                          >
                            {isMainPhoto(
                              !isFile ? img.id : null,
                              idx - numberOfExistingPhotos,
                            ) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6 text-yellow-400 absolute top-0.5 right-0.5 opacity-80"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                            )}

                            <img
                              src={isFile ? URL.createObjectURL(img) : img.url}
                              alt={`Miniatura ${idx + 1}`}
                              className="object-cover w-full h-full p-0.5"
                            />
                          </button>
                        )
                      })}
                    </div>

                    {images.length > 0 ? (
                      <Card className="relative flex flex-col gap-2 p-0 pt-4 rounded-none w-full items-center h-120">
                        <div className="w-full flex justify-between px-4 items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (displayedImageId === null) return
                              const currentDisplayedImage =
                                images[displayedImageId]

                              const isFile =
                                currentDisplayedImage instanceof File &&
                                'arrayBuffer' in currentDisplayedImage

                              if (isFile) {
                                form.setFieldValue(
                                  'mainPhotoIndex',
                                  displayedImageId - numberOfExistingPhotos,
                                )
                                form.setFieldValue('mainPhotoId', null)
                              } else {
                                form.setFieldValue(
                                  'mainPhotoId',
                                  currentDisplayedImage.id,
                                )
                                form.setFieldValue('mainPhotoIndex', null)
                              }
                            }}
                          >
                            Ustaw jako główne
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (displayedImageId === null) return
                              const imageToDelete = images[displayedImageId]
                              const isFile =
                                imageToDelete instanceof File &&
                                'arrayBuffer' in imageToDelete

                              if (
                                isFile &&
                                form.getFieldValue('mainPhotoIndex') ===
                                  displayedImageId - numberOfExistingPhotos
                              ) {
                                form.setFieldValue('mainPhotoIndex', null)
                              }

                              if (
                                !isFile &&
                                form.getFieldValue('mainPhotoId') ===
                                  imageToDelete.id
                              ) {
                                form.setFieldValue('mainPhotoId', null)
                              }

                              form.setFieldValue(
                                'photos',
                                images.filter(
                                  (_, idx) => idx !== displayedImageId,
                                ),
                              )
                              const newImages = images.filter(
                                (_, idx) => idx !== displayedImageId,
                              )

                              if (newImages.length > 0) {
                                const newMainImage = newImages[0]
                                const isNewMainImageFile =
                                  newMainImage instanceof File &&
                                  'arrayBuffer' in newMainImage
                                if (isNewMainImageFile) {
                                  form.setFieldValue('mainPhotoIndex', 0)
                                  form.setFieldValue('mainPhotoId', null)
                                } else {
                                  form.setFieldValue(
                                    'mainPhotoId',
                                    newMainImage.id,
                                  )
                                  form.setFieldValue('mainPhotoIndex', null)
                                }
                                setDisplayedImageId(0)
                              } else {
                                setDisplayedImageId(null)
                              }
                            }}
                          >
                            Usuń zdjęcie
                            <Trash2Icon className="w-4 h-4 text-white" />
                          </Button>
                        </div>
                        <div className="flex flex-1 items-center justify-center p-4 min-h-0">
                          <img
                            src={getDisplayedImageUrl() || undefined}
                            alt="Główne zdjęcie"
                            className="object-contain max-w-full max-h-full rounded-lg"
                          />
                        </div>
                      </Card>
                    ) : (
                      <div className="w-full max-w-sm aspect-square rounded-xl flex items-center justify-center bg-muted text-muted-foreground text-lg">
                        Brak zdjęcia
                      </div>
                    )}
                    <div className="w-full flex flex-col items-center gap-2">
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
                        accept={inputUploadAccept}
                        max={10 - images.length}
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
                  onClick={() => {
                    onClose()
                  }}
                >
                  Anuluj
                </Button>

                <Button
                  type="submit"
                  className="flex-1 h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isPending}
                >
                  {isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
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
