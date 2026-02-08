import { useEffect, useState } from 'react'
import { Calendar, Dog, Hash, Tag, User, XIcon } from 'lucide-react'
import type { CarouselApi } from '@/components/ui/carousel'
import { useAnimalById } from '@/api/animals/queries'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { transformBlobUrl } from '@/lib/utils'

const SPECIES_MAP: Record<number, string> = {
  0: 'Brak',
  1: 'Pies',
  2: 'Kot',
}

const SEX_MAP: Record<number, string> = {
  0: 'Brak',
  1: 'Samiec',
  2: 'Samica',
}

const SEX_ICON: Record<number, string> = {
  0: '',
  1: '♂️',
  2: '♀️',
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return String(date)
  }
}

interface InfoRowProps {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  highlight?: boolean
}

function InfoRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: InfoRowProps) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg ${highlight ? 'bg-primary/5' : 'hover:bg-muted/50'} transition-colors`}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}

export default function AnimalViewTab({
  animalId,
  open,
  onClose,
}: {
  animalId: string
  open: boolean
  onClose: () => void
}) {
  const { data: animal, isLoading } = useAnimalById(animalId)

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!api) return
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  if (isLoading || !animal) {
    return (
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) onClose()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="p-0 bg-transparent shadow-none border-none max-w-4xl"
        >
          <Card className="p-8">
            <div className="flex items-center justify-center h-64">
              <Skeleton className="h-8 w-48" />
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  let imageUrls = animal.photos.map((photo) => transformBlobUrl(photo.blobUrl))

  imageUrls = [...imageUrls, ...imageUrls] // Duplicate for better looping

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-4xl"
      >
        <div className="relative">
          <DialogClose asChild>
            <button
              onClick={onClose}
              className="absolute z-10 top-4 right-4 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none bg-background p-2 shadow-md"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </DialogClose>

          <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">{animal.name}</h2>
                    <span className="text-2xl">{SEX_ICON[animal.sex]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={animal.isActive ? 'default' : 'secondary'}
                      className="text-sm px-3 py-1"
                    >
                      {animal.isActive ? 'Aktywny' : 'Nieaktywny'}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-mono">
                      ID: {animal.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left column - Info */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Dog className="w-5 h-5 text-primary" />
                      Informacje podstawowe
                    </h3>
                    <div className="space-y-1">
                      <InfoRow
                        icon={Tag}
                        label="Oznaczenie"
                        value={animal.signature || '-'}
                        highlight
                      />
                      <InfoRow
                        icon={Hash}
                        label="Numer chipa"
                        value={animal.transponderCode || '-'}
                      />
                      <InfoRow
                        icon={Dog}
                        label="Gatunek"
                        value={SPECIES_MAP[animal.species] || 'Nieznany'}
                      />
                      <InfoRow
                        icon={User}
                        label="Płeć"
                        value={SEX_MAP[animal.sex] || 'Nieznana'}
                      />
                      <InfoRow
                        icon={Tag}
                        label="Umaszczenie"
                        value={animal.color || '-'}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Dates */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Daty
                    </h3>
                    <div className="space-y-1">
                      <InfoRow
                        icon={Calendar}
                        label="Data urodzenia"
                        value={formatDate(animal.birthDate)}
                      />
                      <InfoRow
                        icon={Calendar}
                        label="Data przyjęcia"
                        value={formatDate(animal.createdOn)}
                      />
                      <InfoRow
                        icon={Calendar}
                        label="Ostatnia modyfikacja"
                        value={formatDate(animal.modifiedOn)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right column - Photo */}
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-sm">
                    <Carousel
                      setApi={setApi}
                      opts={{ align: 'center', loop: true }}
                      className="w-full"
                    >
                      <CarouselContent>
                        {imageUrls.map((url, idx) => (
                          <CarouselItem
                            key={idx}
                            className="flex justify-center items-center"
                          >
                            <img
                              src={url}
                              alt={`${animal.name} - zdjęcie ${idx + 1}`}
                              className="rounded-xl shadow-lg object-cover w-full aspect-square"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {imageUrls.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2" />
                          <CarouselNext className="right-2" />
                        </>
                      )}
                    </Carousel>
                    {imageUrls.length > 1 && (
                      <div className="text-muted-foreground py-2 text-center text-sm">
                        Zdjęcie {current} z {count}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
