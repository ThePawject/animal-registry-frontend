import React from 'react'
import { Calendar, Dog, Hash, Tag, Trash2Icon, User, XIcon } from 'lucide-react'
import { useForm, useStore } from '@tanstack/react-form'
import type { AddAnimal, Sexes, Species } from '@/api/animals/types'
import { SEX_MAP, SPECIES_MAP } from '@/api/animals/types'
import { useAddAnimal, useAnimalSignature } from '@/api/animals/queries'
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

const inputUploadAccept = '.jpg,.jpeg,.png,.webp'

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
  className?: string
}

interface ThumbnailImageProps {
  image: File
  alt: string
  generateThumbnail: (file: File) => Promise<string>
  className?: string
}

function ThumbnailImage({
  image,
  alt,
  generateThumbnail,
  className,
}: ThumbnailImageProps) {
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    generateThumbnail(image).then((url) => {
      if (!cancelled) {
        setThumbnailUrl(url)
      }
    })

    return () => {
      cancelled = true
    }
  }, [image, generateThumbnail])

  return (
    <img
      src={thumbnailUrl || ''}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  )
}

function FormField({
  icon: Icon,
  label,
  children,
  error,
  className,
}: FormFieldProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors mb-0 w-full',
      )}
    >
      <div className="flex-shrink-0 mt-2">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <Label htmlFor={label} className="text-sm">
          {label}
        </Label>
        <div className={className}>{children}</div>
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

  const isSignatureError = error?.message.toLowerCase().includes('signature')
  const { mutate: getAnimalSignature, isPending: isGettingAnimalSignature } =
    useAnimalSignature()

  const fileUrlCacheRef = React.useRef<Map<File, string>>(new Map())
  const thumbnailCacheRef = React.useRef<Map<File, string>>(new Map())

  const generateThumbnail = React.useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const cached = thumbnailCacheRef.current.get(file)
      if (cached) {
        resolve(cached)
        return
      }

      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 128
        canvas.width = size
        canvas.height = size

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(objectUrl)
          reject(new Error('Could not get canvas context'))
          return
        }

        const scale = Math.max(size / img.width, size / img.height)
        const x = (size - img.width * scale) / 2
        const y = (size - img.height * scale) / 2

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        thumbnailCacheRef.current.set(file, thumbnailUrl)
        URL.revokeObjectURL(objectUrl)
        resolve(thumbnailUrl)
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load image'))
      }

      img.src = objectUrl
    })
  }, [])

  const getFileUrl = React.useCallback((file: File): string => {
    let url = fileUrlCacheRef.current.get(file)
    if (!url) {
      url = URL.createObjectURL(file)
      fileUrlCacheRef.current.set(file, url)
    }
    return url
  }, [])

  const cleanupFileUrls = React.useCallback(() => {
    fileUrlCacheRef.current.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    fileUrlCacheRef.current.clear()
    thumbnailCacheRef.current.clear()
  }, [])

  React.useEffect(() => {
    return () => {
      cleanupFileUrls()
    }
  }, [cleanupFileUrls])

  const form = useForm({
    defaultValues: defaultAnimalFormData,
    onSubmit: async ({ value }) => {
      await mutateAsync(value)
      cleanupFileUrls()
      form.reset()
      onClose()
    },
  })

  const isDirty = useStore(form.store, (state) => state.isDirty)
  const images = useStore(form.store, (state) => state.values.photos)
  const mainPhotoIndex = useStore(
    form.store,
    (state) => state.values.mainPhotoIndex,
  )
  const [displayedImageId, setDisplayedImageId] = React.useState<number | null>(
    images.length > 0 ? 0 : null,
  )

  const uploadInputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    const imagesOver10MB = files.filter((file) => file.size > 10 * 1024 * 1024)
    if (imagesOver10MB.length > 0) {
      alert(
        `Nie można dodać zdjęć, ponieważ przekraczają one limit 10MB. Proszę wybrać mniejsze pliki.`,
      )
      e.target.value = ''
      return
    }
    if (files.length + images.length > 10) {
      alert(`Możesz dodać maksymalnie 10 zdjęć.`)
      e.target.value = ''
      return
    }
    if (!files.length) return
    form.setFieldValue('photos', [...images, ...files])
    if (images.length === 0 && files.length > 0) {
      form.setFieldValue('mainPhotoIndex', 0)
    }
    e.target.value = ''
    if (displayedImageId === null) {
      setDisplayedImageId(images.length)
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
      cleanupFileUrls()
      form.reset()
      onClose()
    }
  }

  const getDisplayedImageUrl = () => {
    if (displayedImageId === null) return null
    const image = images[displayedImageId]
    return getFileUrl(image)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-6xl max-h-[95vh]"
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
              <h2 className="text-2xl font-semibold">Dodaj zwierzaka</h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6">
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
                        <div className="flex items-end justify-between gap-2 mb-0 w-full">
                          <FormField
                            icon={Tag}
                            label="Oznaczenie"
                            error={field.state.meta.errors[0]}
                            className="flex flex-row gap-2 items-center justify-between w-full flex-1 min-w-0"
                          >
                            <Input
                              value={field.state.value}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              id="Oznaczenie"
                              className="bg-background mb-0"
                              placeholder="Wpisz oznaczenie"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 w-[200px]"
                              size="sm"
                              onClick={() => {
                                getAnimalSignature(undefined, {
                                  onSuccess: (data) => {
                                    form.setFieldValue(
                                      'signature',
                                      data.signature,
                                    )
                                  },
                                })
                              }}
                            >
                              {isGettingAnimalSignature
                                ? 'Ładowanie...'
                                : 'Generuj unikalne oznaczenie'}
                            </Button>
                          </FormField>
                        </div>
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
                            min="2000-01-01"
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
                    <div className="flex gap-2 mb-4 max-w-[535px]">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDisplayedImageId(idx)}
                          className={cn(
                            'relative w-16 h-16 outline-2 -outline-offset-2 rounded-md min-w-16',
                            idx === displayedImageId
                              ? 'outline-emerald-600 shadow-lg'
                              : 'outline-muted hover:outline-muted-foreground',
                          )}
                          type="button"
                        >
                          {mainPhotoIndex === idx && (
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
                          <ThumbnailImage
                            image={img}
                            alt={`Miniatura ${idx + 1}`}
                            generateThumbnail={generateThumbnail}
                            className="object-cover w-full h-full p-0.5"
                          />
                        </button>
                      ))}
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
                              form.setFieldValue(
                                'mainPhotoIndex',
                                displayedImageId,
                              )
                            }}
                          >
                            Ustaw jako główne
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (displayedImageId === null) return
                              const imageToDelete = images[displayedImageId]

                              const fullUrl =
                                fileUrlCacheRef.current.get(imageToDelete)
                              if (fullUrl) {
                                URL.revokeObjectURL(fullUrl)
                                fileUrlCacheRef.current.delete(imageToDelete)
                              }
                              thumbnailCacheRef.current.delete(imageToDelete)

                              const newImages = images.filter(
                                (_, idx) => idx !== displayedImageId,
                              )

                              if (mainPhotoIndex === displayedImageId) {
                                if (newImages.length > 0) {
                                  form.setFieldValue('mainPhotoIndex', 0)
                                } else {
                                  form.setFieldValue('mainPhotoIndex', 0)
                                }
                              } else if (mainPhotoIndex > displayedImageId) {
                                form.setFieldValue(
                                  'mainPhotoIndex',
                                  mainPhotoIndex - 1,
                                )
                              }

                              form.setFieldValue('photos', newImages)

                              if (newImages.length > 0) {
                                setDisplayedImageId(
                                  Math.min(
                                    displayedImageId,
                                    newImages.length - 1,
                                  ),
                                )
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
                      {images.length > 0 && (
                        <div className="px-3 py-1 rounded-full text-sm">
                          {(displayedImageId ?? 0) + 1} / {images.length}
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
                  {isPending ? 'Zapisywanie...' : 'Dodaj zwierzaka'}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 font-medium p-4">
                  {isSignatureError
                    ? 'Oznaczenie jest już zajęte, wygeneruj nowe i spróbuj ponownie.'
                    : genericErrorMessage}
                </p>
              )}
            </form>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
