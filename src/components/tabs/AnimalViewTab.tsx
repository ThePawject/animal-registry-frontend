import { useEffect, useState } from 'react'
import { XIcon } from 'lucide-react'
import type { Animal } from '@/data/animal-data'
import type { CarouselApi } from '@/components/ui/carousel'
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

const STATUS_COLOR: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  adopted: 'bg-blue-100 text-blue-800',
  pending: 'bg-yellow-100 text-yellow-800',
  medical: 'bg-red-100 text-red-800',
}

// Hardcoded image gallery (use Unsplash animal images)
const demoImages = [
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a',
  'https://images.unsplash.com/photo-1507146426996-ef05306b995a',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16',
]

function formatDate(date: any) {
  if (!date) return '-'
  try {
    if (typeof date === 'string' || typeof date === 'number')
      return new Date(date).toLocaleDateString()
    if (date instanceof Date) return date.toLocaleDateString()
  } catch {
    return String(date)
  }
  return String(date)
}

export default function AnimalViewTab({
  animal,
  open,
  onClose,
}: {
  animal: Animal
  open: boolean
  onClose: () => void
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!api) {
      return
    }
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])
  const imageUrls = demoImages // For now, use hardcoded, not per-animal.

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="p-0 bg-transparent shadow-none border-none max-w-fit"
      >
        <div className="relative">
          {/* Close button in top right, absolute over the Card */}
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
            <div className="md:flex gap-8 items-center">
              <div className="flex-1 min-w-[260px]">
                <div className="flex items-center mb-6">
                  <h2 className="text-3xl font-bold mr-4">{animal.name}</h2>
                  <Badge
                    variant="outline"
                    className={
                      STATUS_COLOR[animal.status] +
                      ' text-lg px-4 py-2 capitalize ring-1 ring-inset ring-gray-300'
                    }
                  >
                    {animal.status}
                  </Badge>
                </div>
                <table className="w-full border-separate border-spacing-0 text-base rounded-xl overflow-hidden">
                  <tbody>
                    <tr>
                      <td
                        colSpan={2}
                        className="px-0 pb-2 pt-2 font-bold text-lg text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-200 dark:border-zinc-600"
                      >
                        Informacje podstawowe
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-zinc-700">
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        ID
                      </td>
                      <td className="font-mono text-gray-900 dark:text-gray-50 py-2">
                        {animal.animalId}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-zinc-700">
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Gatunek
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        {animal.type}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-zinc-700">
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Rasa
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        {animal.breed}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-zinc-700">
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Wiek
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        {animal.age} lat
                      </td>
                    </tr>
                    <tr>
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Data przyjęcia
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        {formatDate(animal.admissionDate)}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={2}
                        className="pt-6 pb-2 font-bold text-lg text-gray-900 dark:text-gray-100 bg-transparent border-b border-gray-200 dark:border-zinc-600"
                      >
                        Informacje dodatkowe
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-zinc-700">
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Zarejestrowany numer mikroczipu (uniwersalny)
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        985 112 014 875 596
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-zinc-700">
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Opiekun / Osoba rozpatrująca adopcję
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        Samantha Peterson
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-zinc-700">
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Data ostatniej kontroli weterynaryjnej
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        12 January 2026
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-zinc-700">
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Ograniczenia żywieniowe i uwagi
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        Grain-free, no chicken protein
                      </td>
                    </tr>
                    <tr>
                      <td className="w-56 font-semibold text-gray-700 dark:text-gray-200 py-2 pr-4">
                        Najdłuższy ciągły pobyt w domu tymczasowym
                      </td>
                      <td className="text-gray-900 dark:text-gray-50 py-2">
                        9 months
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-8 md:mb-0 flex flex-col items-center w-104 px-8">
                <Carousel
                  setApi={setApi}
                  opts={{ align: 'center', loop: true }}
                  className="w-full"
                >
                  <CarouselContent>
                    {imageUrls.map((url, idx) => (
                      <CarouselItem
                        key={url}
                        className="flex justify-center items-center h-64"
                      >
                        <img
                          src={url}
                          alt={`Animal slide ${idx + 1}`}
                          className="rounded-xl shadow-lg object-cover w-64 h-64 mx-auto"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                <div className="text-muted-foreground py-2 text-center text-sm">
                  Slajd {current} z {count}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
