import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import {
  BriefcaseMedicalIcon,
  CalendarIcon,
  Edit2Icon,
  ImagesIcon,
  TrashIcon,
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import type { AnimalById } from '@/api/animals/types'
import { Card } from '@/components/ui/card'
import { SEX_MAP, SPECIES_MAP } from '@/api/animals/types'
import { cn } from '@/lib/utils'
import { useDeleteAnimal } from '@/api/animals/queries'

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
  label: string
  info: string
}

function InfoRow({ label, info }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text text-muted-foreground uppercase font-medium">
        {label}
      </span>
      <span className="text-lg text-black font-semibold">{info}</span>
    </div>
  )
}

export default function AnimalViewTab({ animal }: { animal: AnimalById }) {
  const router = useRouter()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { mutate: deleteAnimal } = useDeleteAnimal(() => {
    router.navigate({ to: '/' })
  })

  const mainPhotoUrl = animal.photos.find(
    (photo) => photo.id === animal.mainPhotoId,
  )?.url
  let imageUrls = animal.photos.map((photo) => photo.url)
  if (!imageUrls.length) {
    imageUrls = ['https://placehold.co/400x400?text=Brak+zdjecia']
  }

  const firstFiveUrls = imageUrls.slice(0, 5)
  const remainingUrls = imageUrls.slice(5)

  return (
    <div className="flex flex-col gap-8 px-8 md:px-0 pb-8">
      <div className="flex gap-4 md:gap-8 w-full flex-col md:flex-row">
        <Link
          to="/animal/$animalId/edit"
          params={{ animalId: animal.id }}
          className="bg-white flex flex-1 gap-3 text-slate-700 items-center border border-slate-300 rounded-lg p-2 py-3 w-full hover:bg-emerald-600 hover:text-white justify-center"
        >
          <Edit2Icon className="size-5" />
          <span className="text-lg font-medium">Edytuj dane</span>
        </Link>
        <Link
          to="/animal/$animalId/events"
          params={{ animalId: animal.id }}
          className="bg-white flex flex-1 gap-3 text-slate-700 items-center border border-slate-300 rounded-lg p-2 py-3 w-full hover:bg-emerald-600 hover:text-white justify-center"
        >
          <CalendarIcon className="size-5" />
          <span className="text-lg font-medium">Wydarzenia</span>
        </Link>
        <Link
          to="/animal/$animalId/medical-records"
          params={{ animalId: animal.id }}
          className="bg-white flex flex-1 gap-3 text-slate-700 items-center border border-slate-300 rounded-lg p-2 py-3 w-full hover:bg-emerald-600 hover:text-white justify-center"
        >
          <BriefcaseMedicalIcon className="size-5" />
          <span className="text-lg font-medium">Medyczne</span>
        </Link>
        <Button
          onClick={() => {
            setIsDeleteModalOpen(true)
          }}
          variant="destructive"
          className="flex-1 w-full py-7 border border-red-700 hover:bg-red-700"
        >
          <TrashIcon className="size-5" />
          <span className="text-lg font-medium h-7">Usuń </span>
        </Button>
      </div>
      <Card className="w-full flex gap-5 p-0 relative">
        <div className="flex flex-col md:flex-row gap-8 p-8">
          <img
            src={mainPhotoUrl || imageUrls[0]}
            className="w-64 h-64 object-cover rounded-lg shadow-md"
          />
          <div className="flex flex-col justify-between w-full gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-semibold">{animal.name}</h2>
            </div>
            <div className="grid gap-8 grid-cols-2 md:grid-cols-3">
              <InfoRow label="Gatunek" info={SPECIES_MAP[animal.species]} />
              <InfoRow label="Płeć" info={SEX_MAP[animal.sex]} />
              <InfoRow label="Sygnatura" info={animal.signature} />
              <InfoRow label="Umaszczenie" info={animal.color} />
              <InfoRow
                label="Data urodzenia"
                info={formatDate(animal.birthDate)}
              />
              <InfoRow
                label="Data dodania"
                info={formatDate(animal.modifiedOn)}
              />
            </div>
          </div>
        </div>
        <Badge
          className={cn(
            'absolute hidden md:block top-8 right-8 px-3 py-2 rounded-4xl text-md',
            animal.isInShelter
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600',
          )}
        >
          {`${animal.isInShelter ? 'W schronisku' : 'Poza schroniskiem'}`}
        </Badge>
      </Card>
      <Card className="w-full p-8 flex flex-col gap-8">
        <div className="flex gap-2 items-center">
          <ImagesIcon className="size-8 text-emerald-500" />
          <span className="text-2xl font-semibold ml-2">Galeria Zdjęć</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full flex-1 flex items-center justify-center bg-slate-100 py-8 rounded-xl shadow border border-slate-200">
            <img
              src={imageUrls[selectedIdx]}
              className="h-[200px] md:h-[400px] w-full max-w-[550px] object-contain"
              alt={animal.name + ' podgląd'}
            />
          </div>
          <div className="flex gap-4 items-center">
            {firstFiveUrls.length > 1 && (
              <div className="flex flex-col gap-4 items-center pr-2">
                {firstFiveUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={animal.name + ' zdjęcie ' + (idx + 1)}
                    className={cn(
                      'w-20 h-20 object-cover rounded-md border cursor-pointer transition-all',
                      selectedIdx === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-400'
                        : 'border-slate-300',
                    )}
                    onClick={() => setSelectedIdx(idx)}
                  />
                ))}
              </div>
            )}
            {remainingUrls.length > 1 && (
              <div className="flex flex-col gap-4 items-center pr-2">
                {remainingUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={animal.name + ' zdjęcie ' + (idx + 1)}
                    className={cn(
                      'w-20 h-20 object-cover rounded-md border cursor-pointer transition-all',
                      selectedIdx === idx + 5
                        ? 'border-emerald-500 ring-2 ring-emerald-400'
                        : 'border-slate-300',
                    )}
                    onClick={() => setSelectedIdx(idx + 5)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć {animal.name}? Ta operacja jest
              nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteAnimal({ animalId: animal.id })
                setIsDeleteModalOpen(false)
              }}
            >
              Usuń
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
