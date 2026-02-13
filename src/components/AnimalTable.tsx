import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Calendar,
  Eye,
  Info,
  LucideLoaderCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Stethoscope,
} from 'lucide-react'
import { useDebouncedValue } from '@tanstack/react-pacer'
import AnimalViewTab from './tabs/AnimalViewTab'
import AnimalEventsTab from './tabs/AnimalEventsTab'
import AddAnimalModal from './AddAnimalModal'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { AnimalEditTabWrapper } from './tabs/AnimalEditTab'
import AnimalHealthRecordsTab from './tabs/AnimalHealthRecordsTab'
import DateRangeFilterModal from './modals/DateRangeFilterModal'
import type { ColumnDef } from '@tanstack/react-table'
import type { Animal } from '@/api/animals/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { useAnimals } from '@/api/animals/queries'
import { formatDate } from '@/lib/utils'
import {
  useReports,
  useReportsBySelectedIds,
  useReportsDump,
} from '@/api/reports/queries'

export const createAndDownloadReport = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const SEARCH_INFO_KEY = 'animal-search-info-dismissed'

function AnimalTable() {
  const [page, setPage] = React.useState(1)
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pageSize, setPageSize] = React.useState(10)

  const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, {
    wait: 500,
  })

  const { data: animalsPage, isPending } = useAnimals({
    keyWordSearch: debouncedGlobalFilter,
    page: page,
    pageSize,
  })

  const { mutate: getReports, isPending: isReportsPending } = useReports(
    ({ blob, filename }) => createAndDownloadReport(blob, filename),
  )
  const { mutate: getReportsDump, isPending: isReportsDumpPending } =
    useReportsDump(({ blob, filename }) =>
      createAndDownloadReport(blob, filename),
    )
  const {
    mutate: getReportsBySelectedIds,
    isPending: isReportsBySelectedIdsPending,
  } = useReportsBySelectedIds(({ blob, filename }) =>
    createAndDownloadReport(blob, filename),
  )

  const totalPages = animalsPage
    ? Math.ceil(animalsPage.totalCount / pageSize)
    : 1
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedAnimal, setSelectedAnimal] = React.useState<Animal | null>(
    null,
  )

  const [openViewModal, setOpenViewModal] = React.useState(false)
  const [openEditModal, setOpenEditModal] = React.useState(false)
  const [openMedicalModal, setOpenMedicalModal] = React.useState(false)
  const [openEventsModal, setOpenEventsModal] = React.useState(false)
  const [openAddModal, setOpenAddModal] = React.useState(false)
  const [openDateRangeModal, setOpenDateRangeModal] = React.useState(false)

  const columns = React.useMemo<Array<ColumnDef<Animal, any>>>(
    () => [
      {
        id: 'select',
        header: () => {
          const selectedCount = Object.keys(
            table.getState().rowSelection,
          ).length
          if (selectedCount === 0) return null
          return (
            <div className="h-10 flex items-center justify-center">
              <Checkbox
                checked
                onCheckedChange={(value) =>
                  table.toggleAllRowsSelected(!!value)
                }
                aria-label="Select all rows"
              />
            </div>
          )
        },

        cell: ({ row }) => (
          <div className="h-10 flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()} // Prevent modal open on checkbox click
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'mainPhoto',
        header: 'Zdjęcie',
        cell: (info) => {
          const mainPhoto = info.row.original.mainPhoto
          if (mainPhoto?.url) {
            return (
              <img
                src={mainPhoto.url}
                alt={info.row.original.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
            )
          }
          return (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
              Brak
            </div>
          )
        },
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
          <div className="max-w-[200px] truncate">
            {info.getValue() as string}
          </div>
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
            {info.getValue() as string}
          </div>
        ),
      },
      {
        accessorKey: 'birthDate',
        header: 'Wiek',
        cell: (info) => {
          const birthDate = new Date(info.getValue() as string)
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
        cell: (info) => {
          const isInShelter = info.getValue() as boolean
          return (
            <div className="max-w-[120px] truncate">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isInShelter
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}
              >
                {isInShelter ? 'W schronisku' : 'Poza schroniskiem'}
              </span>
            </div>
          )
        },
        filterFn: 'includesString',
      },
      {
        accessorKey: 'createdOn',
        header: 'Data przyjęcia',
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAnimal(row.original)
                  setOpenViewModal(true)
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Podgląd
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAnimal(row.original)
                  setOpenEditModal(true)
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edytuj
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAnimal(row.original)
                  setOpenMedicalModal(true)
                }}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Medyczne
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedAnimal(row.original)
                  setOpenEventsModal(true)
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Wydarzenia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [],
  )

  // Reset to first page on search change
  React.useEffect(() => {
    setPage(1)
  }, [debouncedGlobalFilter])

  const table = useReactTable({
    data: animalsPage?.items || [],
    columns,
    state: {
      globalFilter,
      rowSelection,
    },
    enableMultiRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row.id.toString(),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  })

  const selectedRows = table.getState().rowSelection
  const selectedIds = Object.keys(selectedRows)

  const selectedCount = Object.keys(table.getState().rowSelection).length
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
    <div className="space-y-4 max-w-[1440px] mx-auto px-4 md:px-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 max-w-sm w-full">
          <Input
            placeholder="Szukaj zwierząt..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            onFocus={handleInputFocus}
            className="md:text-xl h-12 shrink-0 flex-1"
          />
          <HoverCard
            openDelay={100}
            closeDelay={200}
            open={infoOpen}
            onOpenChange={setInfoOpen}
          >
            <HoverCardTrigger asChild>
              <button
                type="button"
                onClick={() => setInfoOpen(!infoOpen)}
                className="p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Informacje o wyszukiwaniu"
              >
                <Info className="size-8 text-blue-600" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-96" side="right" align="start">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold">Jak działa wyszukiwanie?</h4>
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
                      <strong>Wydarzenia</strong> - opis lub kto wykonał
                    </li>
                  </ul>
                  <p className="text-xs italic">
                    Wpisz fragment tekstu, a wyniki pojawią się automatycznie.
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
            </HoverCardContent>
          </HoverCard>
        </div>

        <div className="flex gap-2 xl:items-center flex-col xl:flex-row w-full xl:justify-end">
          <Button
            variant="outline"
            title="Wygeneruj PDF z zestawieniem zdarzeń za wybrany okres (Raport-Zdarzen)"
            onClick={() => {
              getReports()
            }}
            disabled={isReportsPending}
          >
            {isReportsPending ? (
              <LucideLoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              'Raport zdarzeń'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              getReportsDump()
            }}
            title="Eksport tekstowy danych zwierząt do PDF (bez zdjęć)."
            disabled={isReportsDumpPending}
          >
            {isReportsDumpPending ? (
              <LucideLoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              'Raport wszystkie zwierzeta'
            )}
          </Button>
          <Button
            disabled={selectedCount === 0 || isReportsBySelectedIdsPending}
            variant="outline"
            onClick={() => {
              if (selectedIds.length > 0) {
                getReportsBySelectedIds({ ids: selectedIds })
              }
            }}
            title="PDF zawierający dane i zdjęcia wybranych zwierząt (siatka zdjęć)."
          >
            {isReportsBySelectedIdsPending ? (
              <LucideLoaderCircle className="w-4 h-4 animate-spin" />
            ) : selectedCount > 0 ? (
              `Raport z wybranych zwierzat (${selectedCount})`
            ) : (
              'Raport z wybranych zwierzat'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setOpenDateRangeModal(true)
            }}
            title="Wygeneruj raport dla zdefiniowanego zakresu dat (miesiąc/kwartał/tydzień)."
          >
            Raport zdarzen w zakresie
          </Button>

          <Button
            onClick={() => setOpenAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="size-5" /> Dodaj zwierzę
          </Button>
        </div>
      </div>

      <div className="rounded-md border max-w-[1440px] w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b bg-muted/50 px-4 py-3 text-left font-medium text-sm"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isPending ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b">
                  {columns.map((_, colIndex) => (
                    <td key={`skeleton-cell-${colIndex}`} className="px-4 py-3">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  Brak wyników.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-2">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="text-sm">Wierszy na stronę:</label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPage(1)
              setPageSize(Number(value))
              window.scrollTo({ top: 0, behavior: 'instant' })
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((i) => Math.max(1, i - 1))}
            disabled={page === 1 || isPending}
          >
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((i) => i + 1)}
            disabled={page === totalPages || isPending}
          >
            Następna
          </Button>
        </div>
      </div>
      {/* View Modal */}
      {selectedAnimal && (
        <AnimalViewTab
          animalId={selectedAnimal.id}
          open={openViewModal && !!selectedAnimal}
          onClose={() => setOpenViewModal(false)}
        />
      )}

      {/* Edit Modal */}
      {selectedAnimal && (
        <AnimalEditTabWrapper
          animalId={selectedAnimal.id}
          open={openEditModal && !!selectedAnimal}
          onClose={() => setOpenEditModal(false)}
        />
      )}

      {/* Medical Modal */}
      {selectedAnimal && (
        <AnimalHealthRecordsTab
          animalId={selectedAnimal.id}
          open={openMedicalModal && !!selectedAnimal}
          onClose={() => setOpenMedicalModal(false)}
        />
      )}

      {/* Events Modal */}
      {selectedAnimal && (
        <AnimalEventsTab
          animalId={selectedAnimal.id}
          open={openEventsModal && !!selectedAnimal}
          onClose={() => setOpenEventsModal(false)}
        />
      )}

      {/* Add Animal Modal */}
      <AddAnimalModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
      />
      <DateRangeFilterModal
        open={openDateRangeModal}
        onClose={() => setOpenDateRangeModal(false)}
      />
    </div>
  )
}

export default AnimalTable
