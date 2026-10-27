import React from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { CircleHelp, Eye, Plus, Search } from 'lucide-react'
import { useDebouncedValue } from '@tanstack/react-pacer'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import AnimalPhotoThumbnail from './AnimalPhotoThumbnail'
import AnimalShelterStatusBadge from './AnimalShelterStatusBadge'
import DataTable from './DataTable'
import TablePagination from './TablePagination'
import { InfoCard } from './InfoCard'
import type { IndexSearch } from '@/routes/_app/panel'
import type { ColumnDef } from '@tanstack/react-table'
import type { Animal, Species } from '@/api/animals/types'
import { SPECIES_MAP } from '@/api/animals/types'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useAnimals } from '@/api/animals/queries'
import { formatDate } from '@/lib/utils'
import { getAppScrollContainer } from '@/lib/navigation'

const SEARCH_INFO_KEY = 'animal-search-info-dismissed'

const routeApi = getRouteApi('/_app/panel')

function AnimalTable() {
  const search = routeApi.useSearch()
  const navigate = useNavigate({ from: '/panel' })

  const setSearch = (
    patch: Partial<{
      query: string | undefined
      species: Species | undefined
      isInShelter: boolean | undefined
      page: number
      pageSize: 10 | 20 | 50
    }>,
  ) => navigate({ search: (prev: IndexSearch) => ({ ...prev, ...patch }) })

  const [inputValue, setInputValue] = React.useState(search.query ?? '')
  const [debouncedQuery] = useDebouncedValue(inputValue, { wait: 500 })

  React.useEffect(() => {
    const nextQuery = debouncedQuery || undefined
    if (nextQuery !== search.query) {
      setSearch({ query: nextQuery, page: 1 })
    }
  }, [debouncedQuery])

  const page = search.page ?? 1
  const pageSize = search.pageSize ?? 20

  const {
    data: animalsPage,
    isPending,
    isPlaceholderData,
  } = useAnimals({
    keyWordSearch: search.query ?? null,
    page,
    pageSize,
    species: search.species ?? null,
    isInShelter: search.isInShelter ?? null,
  })

  const totalPages = animalsPage
    ? Math.max(1, Math.ceil(animalsPage.totalCount / pageSize))
    : 1

  React.useEffect(() => {
    if (animalsPage && !isPlaceholderData && page > totalPages) {
      navigate({
        search: (prev: IndexSearch) => ({ ...prev, page: totalPages }),
        replace: true,
      })
    }
  }, [animalsPage, isPlaceholderData, page, totalPages])

  const columns = React.useMemo<Array<ColumnDef<Animal, any>>>(
    () => [
      {
        id: 'mainPhoto',
        header: 'Zdjęcie',
        cell: (info) => <AnimalPhotoThumbnail animal={info.row.original} />,
        meta: {
          width: '100px',
        },
      },
      {
        accessorKey: 'signature',
        header: 'Oznaczenie',
        cell: (info) => (
          <div className="max-w-[100px] truncate">
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Imię',
        cell: (info) => (
          <div className="max-w-[200px] truncate">{info.getValue() || '-'}</div>
        ),
      },
      {
        accessorKey: 'breed',
        header: 'Rasa',
        cell: (info) => (
          <div className="max-w-[100px] truncate">{info.getValue() || '-'}</div>
        ),
      },
      {
        accessorKey: 'distinguishingMarks',
        header: 'Znaki szczególne',
        cell: (info) => (
          <div className="max-w-[100px] truncate">{info.getValue() || '-'}</div>
        ),
      },
      {
        accessorKey: 'species',
        header: 'Gatunek',
        cell: (info) => {
          const speciesMap: Record<number, string> = {
            0: 'Brak',
            1: 'Pies',
            2: 'Kot',
          }
          return (
            <div className="max-w-[100px] truncate">
              {speciesMap[info.getValue() as number] || 'Nieznany'}
            </div>
          )
        },
      },
      {
        accessorKey: 'sex',
        header: 'Płeć',
        cell: (info) => {
          const sexMap: Record<number, string> = {
            0: 'Brak',
            1: 'Samiec',
            2: 'Samica',
          }
          return (
            <div className="max-w-[100px] truncate">
              {sexMap[info.getValue() as number] || 'Nieznana'}
            </div>
          )
        },
      },
      {
        accessorKey: 'color',
        header: 'Umaszczenie',
        cell: (info) => (
          <div className="max-w-[100px] truncate">
            {(info.getValue() as string) || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'birthDate',
        header: 'Wiek',
        cell: (info) => {
          const value = info.getValue() as string | null
          if (!value) return <div className="max-w-fit">Brak danych</div>
          const birthDate = new Date(info.getValue())
          const ageDifMs = Date.now() - birthDate.getTime()
          const ageDate = new Date(ageDifMs)
          const years = Math.abs(ageDate.getUTCFullYear() - 1970)
          const months = ageDate.getUTCMonth()
          const weeks = Math.floor(ageDate.getUTCDate() / 7)
          const getAgeString = () => {
            if (years === 0 && months === 0 && weeks === 0)
              return 'Mniej niż tydzień'
            if (years === 0 && months === 0) return `${weeks} tyg.`
            if (years === 0)
              return `${months} mies. ${weeks > 0 ? `${weeks} tyg.` : ''}`
            if (years > 0 && months > 0) return `${years} lat ${months} mies.`
            return `${years} lat`
          }

          return <div className="max-w-fit">{getAgeString()}</div>
        },
        filterFn: 'includesString',
      },
      {
        accessorKey: 'isInShelter',
        header: 'Status',
        cell: (info) => (
          <div className="max-w-[120px] truncate">
            <AnimalShelterStatusBadge
              isInShelter={info.getValue() as boolean}
            />
          </div>
        ),
        filterFn: 'includesString',
      },
      {
        accessorKey: 'createdOn',
        header: 'Data dodania',
        cell: (info) => {
          const date = new Date(info.getValue() as string)
          return (
            <div className="max-w-[100px] truncate">
              {formatDate(date.toISOString())}
            </div>
          )
        },
        filterFn: 'includesString',
      },
      // Actions column
      {
        id: 'actions',
        header: 'Akcje',
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link
              to="/animal/$animalId"
              params={{ animalId: row.original.id }}
              className="flex items-center w-full"
            >
              <Eye className="w-4 h-4 md:mr-2" />
              <span className="sr-only md:not-sr-only">Szczegóły</span>
            </Link>
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  )

  const table = useReactTable({
    data: animalsPage?.items || [],
    columns,
    getRowId: (row) => row.id.toString(),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  const [infoOpen, setInfoOpen] = React.useState(false)
  const [hasBeenDismissed, setHasBeenDismissed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(SEARCH_INFO_KEY)
      return dismissed === 'true'
    }
    return false
  })

  const handleInputFocus = () => {
    if (!hasBeenDismissed) {
      setInfoOpen(true)
    }
  }

  const handleDismiss = () => {
    setInfoOpen(false)
    setHasBeenDismissed(true)
    localStorage.setItem(SEARCH_INFO_KEY, 'true')
  }

  return (
    <div className="-mt-4 flex flex-col gap-4 mx-auto px-4 md:px-0 w-full pb-8">
      <div className="bg-muted/30 rounded-lg p-4 border">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <InputGroup className="h-10 bg-white">
              <InputGroupInput
                placeholder="Szukaj zwierząt..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
              />
              <InputGroupAddon>
                <Search className="size-4 text-slate-400" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end" className="gap-1">
                <span aria-hidden className="h-5 w-px bg-slate-200" />
                <InfoCard
                  infoOpen={infoOpen}
                  setInfoOpen={setInfoOpen}
                  icon={CircleHelp}
                  side="bottom"
                  align="end"
                  className="group flex size-7 cursor-pointer items-center justify-center rounded-md p-0 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus:ring-0"
                  iconClassName="size-[18px] text-slate-400 transition-colors group-hover:text-slate-700 group-data-[state=open]:text-emerald-600"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold">
                        Jak działa wyszukiwanie?
                      </h4>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Możesz szukać zwierząt po następujących polach:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          <strong>Oznaczenie</strong> - np. 2026/0017
                        </li>
                        <li>
                          <strong>Numer chipa</strong> - np. 616093900000000
                        </li>
                        <li>
                          <strong>Imię</strong> - np. Mariusz
                        </li>
                        <li>
                          <strong>Umaszczenie</strong> - np. czarny
                        </li>
                        <li>
                          <strong>Rasa</strong> - np. mieszaniec
                        </li>
                        <li>
                          <strong>Znaki Szczególne</strong> - np. brak ogona,
                          białe łapy
                        </li>

                        <li>
                          <strong>Wydarzenia</strong> - opis lub kto wykonał
                        </li>
                      </ul>
                      <p className="text-xs italic">
                        Wpisz fragment tekstu, a wyniki pojawią się
                        automatycznie.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDismiss}
                      className="w-full mt-2"
                    >
                      Nie pokazuj ponownie
                    </Button>
                  </div>
                </InfoCard>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <Select
            value={
              search.species === undefined ? 'all' : search.species.toString()
            }
            onValueChange={(value) => {
              setSearch({
                species:
                  value === 'all' ? undefined : (Number(value) as Species),
                page: 1,
              })
            }}
          >
            <SelectTrigger
              aria-label="Gatunek"
              className="w-full md:w-[180px] data-[size=default]:h-10 bg-white"
            >
              <SelectValue placeholder="Wszystkie gatunki">
                {search.species !== undefined
                  ? SPECIES_MAP[search.species]
                  : 'Wszystkie gatunki'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie gatunki</SelectItem>
              <SelectItem value="1">Pies</SelectItem>
              <SelectItem value="2">Kot</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={
              search.isInShelter === undefined
                ? 'all'
                : search.isInShelter.toString()
            }
            onValueChange={(value) => {
              setSearch({
                isInShelter: value === 'all' ? undefined : value === 'true',
                page: 1,
              })
            }}
          >
            <SelectTrigger
              aria-label="Status"
              className="w-full md:w-[200px] data-[size=default]:h-10 bg-white"
            >
              <SelectValue placeholder="Wszystkie statusy">
                {search.isInShelter === undefined
                  ? 'Wszystkie statusy'
                  : search.isInShelter
                    ? 'W schronisku'
                    : 'Poza schroniskiem'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              <SelectItem value="true">W schronisku</SelectItem>
              <SelectItem value="false">Poza schroniskiem</SelectItem>
            </SelectContent>
          </Select>

          <Button
            asChild
            className="w-full md:w-auto h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Link to="/create">
              <Plus className="size-5" /> Dodaj zwierzę
            </Link>
          </Button>
        </div>
      </div>

      <DataTable
        table={table}
        columns={columns}
        isPending={isPending}
        isPlaceholderData={isPlaceholderData}
        pageSize={pageSize}
      />

      <TablePagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        disabled={isPending || isPlaceholderData}
        onPageChange={(nextPage) => setSearch({ page: nextPage })}
        onPageSizeChange={(nextPageSize) => {
          setSearch({ page: 1, pageSize: nextPageSize })
          getAppScrollContainer()?.scrollTo({ top: 0, behavior: 'instant' })
        }}
      />
    </div>
  )
}

export default AnimalTable
