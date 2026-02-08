import React from 'react'
import { XIcon } from 'lucide-react'
import type { Animal } from '@/api/animals/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useAppForm } from '@/hooks/Form'

const SPECIES_OPTIONS = [
  { label: 'Brak', value: '0' },
  { label: 'Pies', value: '1' },
  { label: 'Kot', value: '2' },
] as const

const SEX_OPTIONS = [
  { label: 'Brak', value: '0' },
  { label: 'Samiec', value: '1' },
  { label: 'Samica', value: '2' },
] as const

function formatDate(date: any) {
  if (!date) return ''
  try {
    if (typeof date === 'string' || typeof date === 'number')
      return new Date(date).toISOString().slice(0, 10)
    if (date instanceof Date) return date.toISOString().slice(0, 10)
  } catch {
    return String(date)
  }
  return String(date)
}

interface ImgFile {
  file: File
  url: string
}

export default function AnimalEditTab({
  animal,
  open,
  onClose,
}: {
  animal: Animal
  open: boolean
  onClose: () => void
}) {
  const form = useAppForm({
    defaultValues: {
      name: animal.name || '',
      signature: animal.signature || '',
      transponderCode: animal.transponderCode || '',
      color: animal.color || '',
      species: animal.species.toString(),
      sex: animal.sex.toString(),
      birthDate: formatDate(animal.birthDate),
      isActive: animal.isActive,
    },
    onSubmit: ({ value }) => {
      alert(`Zwierze zaktualizowano:  ${JSON.stringify(value, null, 2)}`)
      // Optionally: onClose();
    },
  })

  // Image state
  const [images, setImages] = React.useState<Array<ImgFile>>([])
  const [mainImageId, setMainImageId] = React.useState(0)

  // File input hidden ref
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    // append new files
    const newImgs: Array<ImgFile> = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImgs])
    if (images.length === 0 && newImgs.length > 0) setMainImageId(0)
    e.target.value = '' // reset so re-upload of same file works
  }

  const removeImage = (idx: number) => {
    setImages((imgs) => {
      const imgsCopy = imgs.slice()
      URL.revokeObjectURL(imgsCopy[idx].url)
      imgsCopy.splice(idx, 1)
      // if main was removed, reset to 0
      if (mainImageId >= imgsCopy.length)
        setMainImageId(Math.max(0, imgsCopy.length - 1))
      return imgsCopy
    })
  }

  // Clean up URL blobs on unmount
  React.useEffect(
    () => () => {
      images.forEach((img) => URL.revokeObjectURL(img.url))
    },
    [images],
  )

  const slidesToShow = Math.min(2, images.length)
  const slidesWidth = `${100 / slidesToShow}%`
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-6xl"
      >
        <div className="relative">
          <DialogClose asChild>
            <button
              onClick={onClose}
              className="absolute z-10 top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none bg-white dark:bg-zinc-900 p-2"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </DialogClose>

          <Card className="max-w-none w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }}
              className="md:flex gap-8 items-center"
            >
              <div className="mb-8 md:mb-0 flex flex-col w-104 px-8 gap-4">
                <h2 className="text-3xl font-bold mr-4">
                  Edytuj: {animal.name || '(imię)'}
                </h2>
                <form.AppField
                  name="name"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value || value.trim().length === 0) {
                        return 'Nazwa jest wymagana'
                      }
                      return undefined
                    },
                  }}
                >
                  {(field) => <field.TextField label="Imię" />}
                </form.AppField>
                <form.AppField name="signature">
                  {(field) => <field.TextField label="Oznaczenie" />}
                </form.AppField>
                <form.AppField name="transponderCode">
                  {(field) => (
                    <field.TextField label="Kod transpondera (chip)" />
                  )}
                </form.AppField>
                <form.AppField name="species">
                  {(field) => (
                    <field.Select
                      label="Gatunek"
                      values={[...SPECIES_OPTIONS]}
                      placeholder="Wybierz gatunek"
                    />
                  )}
                </form.AppField>
                <form.AppField name="sex">
                  {(field) => (
                    <field.Select
                      label="Płeć"
                      values={[...SEX_OPTIONS]}
                      placeholder="Wybierz płeć"
                    />
                  )}
                </form.AppField>
                <form.AppField name="color">
                  {(field) => <field.TextField label="Umaszczenie" />}
                </form.AppField>
                <form.AppField name="birthDate">
                  {(field) => (
                    <field.TextField
                      label="Data urodzenia"
                      placeholder="RRRR-MM-DD"
                    />
                  )}
                </form.AppField>
                <form.AppField name="isActive">
                  {(field) => (
                    <field.Select
                      label="Status"
                      values={[
                        { label: 'Aktywny', value: 'true' },
                        { label: 'Nieaktywny', value: 'false' },
                      ]}
                      placeholder="Wybierz status"
                    />
                  )}
                </form.AppField>
                <div className="flex gap-6 mt-8 items-center">
                  <Button
                    type="submit"
                    className="text-xl px-8 py-4 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Zapisz
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-xl px-8 py-4 font-bold border-gray-300"
                    onClick={onClose}
                  >
                    Anuluj
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-w-[260px] px-8">
                <div className="relative mb-4 flex items-center justify-center">
                  {images.length ? (
                    <Carousel
                      opts={{
                        startIndex: mainImageId,
                        slidesToScroll: slidesToShow,
                      }}
                    >
                      <CarouselContent>
                        {images.map((img, idx) => (
                          <CarouselItem
                            key={idx}
                            className="group relative h-96 flex justify-center items-center select-none"
                            style={{ flex: `0 0 ${slidesWidth}` }}
                          >
                            <img
                              src={img.url}
                              alt={
                                idx === mainImageId
                                  ? 'Main animal preview'
                                  : 'Animal image'
                              }
                              className={`rounded-xl shadow-lg object-cover w-96 h-96 border-4 ${idx === mainImageId ? 'border-indigo-500' : 'border-transparent'}`}
                            />
                            {idx === mainImageId ? (
                              <Badge className="absolute left-6 top-2 text-xs bg-indigo-100 text-indigo-700 py-2">
                                Główne zdjęcie
                              </Badge>
                            ) : (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="opacity-0 hover:opacity-100 group-hover:opacity-100 absolute left-6 top-2 text-xs transition-opacity duration-200"
                                onClick={() => setMainImageId(idx)}
                              >
                                Ustaw jako główne
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 absolute right-2 top-2 text-xs transition-opacity duration-200"
                              onClick={() => removeImage(idx)}
                            >
                              Usuń
                            </Button>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  ) : (
                    <div className="size-96 rounded-xl flex items-center justify-center bg-gray-100 text-gray-400 text-xl shadow-inner">
                      Brak zdjęcia
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  className="py-3 px-6 text-lg w-full"
                  onClick={() => inputRef.current?.click()}
                >
                  Wgraj zdjęcia
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  ref={inputRef}
                  onChange={handleUpload}
                />
              </div>
            </form>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
