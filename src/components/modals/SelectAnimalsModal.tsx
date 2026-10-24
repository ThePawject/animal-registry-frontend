import { useState } from 'react'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Animal } from '@/api/animals/types'
import { SPECIES_MAP } from '@/api/animals/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnimals } from '@/api/animals/queries'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 20

export type SelectedAnimals = Map<string, Animal>

interface SelectAnimalsModalProps {
  open: boolean
  selected: SelectedAnimals
  onSelectedChange: (selected: SelectedAnimals) => void
  onClose: () => void
}

export default function SelectAnimalsModal({
  open,
  selected,
  onSelectedChange,
  onClose,
}: SelectAnimalsModalProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebouncedValue(query, { wait: 300 })
  // The page belongs to the search it was picked for, so it falls back to 1
  // together with the debounced query rather than on every keystroke.
  const [pagination, setPagination] = useState({ query: '', page: 1 })
  const page = pagination.query === debouncedQuery ? pagination.page : 1
  const setPage = (nextPage: number) =>
    setPagination({ query: debouncedQuery, page: nextPage })

  const { data, isPending, isPlaceholderData } = useAnimals({
    page,
    pageSize: PAGE_SIZE,
    keyWordSearch: debouncedQuery.trim() || null,
  })

  const animals = data?.items ?? []
  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE))
    : 1
  const selectedOnPage = animals.filter((animal) => selected.has(animal.id))
  const isWholePageSelected =
    animals.length > 0 && selectedOnPage.length === animals.length

  const toggleAnimal = (animal: Animal) => {
    const next = new Map(selected)
    if (next.has(animal.id)) next.delete(animal.id)
    else next.set(animal.id, animal)
    onSelectedChange(next)
  }

  const toggleWholePage = () => {
    const next = new Map(selected)
    for (const animal of animals) {
      if (isWholePageSelected) next.delete(animal.id)
      else next.set(animal.id, animal)
    }
    onSelectedChange(next)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) onClose()
      }}
    >
      <DialogContent className="flex h-[85vh] w-full max-w-7xl flex-col gap-4 overflow-hidden p-6">
        <DialogHeader>
          <DialogTitle>Wybierz zwierzęta do raportu</DialogTitle>
          <DialogDescription>
            Zaznaczenie zostaje przy zmianie strony i wyszukiwaniu.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Szukaj po imieniu lub sygnaturze"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-background"
        />

        <div
          className={cn(
            'min-h-0 flex-1 overflow-auto rounded-md border transition-opacity',
            isPlaceholderData && 'opacity-60',
          )}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="sticky top-0 z-10 bg-muted">
                <th className="w-12 border-b px-4 py-3">
                  <Checkbox
                    checked={isWholePageSelected}
                    onCheckedChange={toggleWholePage}
                    disabled={animals.length === 0}
                    aria-label="Zaznacz wszystkie na stronie"
                  />
                </th>
                <th className="border-b px-4 py-3 text-left font-medium">
                  Zdjęcie
                </th>
                <th className="border-b px-4 py-3 text-left font-medium">
                  Oznaczenie
                </th>
                <th className="border-b px-4 py-3 text-left font-medium">
                  Imię
                </th>
                <th className="border-b px-4 py-3 text-left font-medium">
                  Gatunek
                </th>
                <th className="border-b px-4 py-3 text-left font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td colSpan={6} className="px-4 py-2">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : animals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-24 text-center">
                    Brak wyników.
                  </td>
                </tr>
              ) : (
                animals.map((animal) => {
                  const isSelected = selected.has(animal.id)
                  return (
                    <tr
                      key={animal.id}
                      onClick={() => toggleAnimal(animal)}
                      className={cn(
                        'cursor-pointer border-b transition-colors hover:bg-muted',
                        isSelected && 'bg-muted/60',
                      )}
                    >
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={isSelected}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleAnimal(animal)}
                          aria-label={`Zaznacz ${animal.name || animal.signature}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        {animal.mainPhoto?.url ? (
                          <img
                            src={animal.mainPhoto.url}
                            alt={animal.name || 'Zdjęcie zwierzęcia'}
                            className="size-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-400">
                            Brak
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2">{animal.signature}</td>
                      <td className="px-4 py-2">{animal.name || '-'}</td>
                      <td className="px-4 py-2">
                        {SPECIES_MAP[animal.species]}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={cn(
                            'rounded-full px-2 py-1 text-xs font-medium',
                            animal.isInShelter
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800',
                          )}
                        >
                          {animal.isInShelter
                            ? 'W schronisku'
                            : 'Poza schroniskiem'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-label="Poprzednia strona"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm">
              Strona {page} z {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              aria-label="Następna strona"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              Wybrano: {selected.size}
            </span>
            <Button
              variant="outline"
              disabled={selected.size === 0}
              onClick={() => onSelectedChange(new Map())}
            >
              Wyczyść
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={onClose}
            >
              Gotowe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
