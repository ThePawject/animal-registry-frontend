import { useState } from 'react'
import { Calendar, Dog, Hash, Tag, User, XIcon } from 'lucide-react'
import { useAnimalById } from '@/api/animals/queries'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { SEX_MAP, SPECIES_MAP } from '@/api/animals/types'

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
  const [selectedIdx, setSelectedIdx] = useState(0)

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

  let imageUrls = animal.photos.map((photo) => photo.url)
  if (!imageUrls.length) {
    imageUrls = ['https://placehold.co/400x400?text=Brak+zdjecia']
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-4xl max-h-[90vh]"
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

          <Card className="overflow-hidden max-h-[90vh] py-0">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">{animal.name}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 pb-2 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Info */}
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
                        label="Data dodania"
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
                <div className="flex flex-col items-center">
                  <div className="flex gap-2 mb-4 overflow-x-auto max-w-full w-[calc(100%-1rem)] px-2">
                    {imageUrls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIdx(idx)}
                        className={cn(
                          'w-16 h-16 rounded border-2 flex-shrink-0 overflow-hidden p-0 transition-all',
                          selectedIdx === idx
                            ? 'border-primary shadow-lg'
                            : 'border-muted',
                        )}
                        aria-label={`Miniatura zdjęcia ${idx + 1}`}
                        tabIndex={0}
                        type="button"
                      >
                        <img
                          src={url}
                          alt={`Miniatura ${animal.name} - zdjęcie ${idx + 1}`}
                          className="object-cover w-full h-full"
                          draggable={false}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="w-full max-w-sm flex justify-center items-center">
                    <img
                      src={imageUrls[selectedIdx]}
                      alt={`${animal.name} - zdjęcie główne`}
                      className="rounded-xl shadow-lg w-full h-auto max-h-[70vh]"
                      draggable={false}
                    />
                  </div>
                  {imageUrls.length > 1 && (
                    <div className="text-muted-foreground py-2 text-center text-sm">
                      Zdjęcie {selectedIdx + 1} z {imageUrls.length}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
