import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Calendar, Eye, Pencil, Plus, Stethoscope } from 'lucide-react'
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

function AnimalTable() {
  const [page, setPage] = React.useState(1)
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pageSize, setPageSize] = React.useState(10)

  const [debouncedGlobalFilter] = useDebouncedValue(globalFilter, {
    wait: 500,
  })

  const { data: animalsPage, isLoading } = useAnimals({
    keyWordSearch: debouncedGlobalFilter,
    page: page,
    pageSize,
  })

  const { mutate: getReports } = useReports(({ blob, filename }) =>
    createAndDownloadReport(blob, filename),
  )
  const { mutate: getReportsDump } = useReportsDump(({ blob, filename }) =>
    createAndDownloadReport(blob, filename),
  )
  const { mutate: getReportsBySelectedIds } = useReportsBySelectedIds(
    ({ blob, filename }) => createAndDownloadReport(blob, filename),
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
      },
      {
        accessorKey: 'signature',
        header: 'Oznaczenie',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'name',
        header: 'Imię',
        cell: (info) => info.getValue(),
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
          return speciesMap[info.getValue() as number] || 'Nieznany'
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
          return sexMap[info.getValue() as number] || 'Nieznana'
        },
      },
      {
        accessorKey: 'color',
        header: 'Umaszczenie',
        cell: (info) => info.getValue(),
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
          return `${years} lat${months > 0 ? ` ${months} mies.` : ''}`
        },
        filterFn: 'includesString',
      },
      {
        accessorKey: 'isInShelter',
        header: 'Status',
        cell: (info) => {
          const isInShelter = info.getValue() as boolean
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isInShelter
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              }`}
            >
              {isInShelter ? 'Aktywny' : 'Nieaktywny'}
            </span>
          )
        },
        filterFn: 'includesString',
      },
      {
        accessorKey: 'createdOn',
        header: 'Data przyjęcia',
        cell: (info) => {
          const date = new Date(info.getValue() as string)
          return formatDate(date.toISOString())
        },
        filterFn: 'includesString',
      },
      // Actions column
      {
        id: 'actions',
        header: 'Akcje',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedAnimal(row.original)
                setOpenViewModal(true)
              }}
            >
              <Eye className="w-4 h-4 mr-1" /> Podgląd
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedAnimal(row.original)
                setOpenEditModal(true)
              }}
            >
              <Pencil className="w-4 h-4 mr-1" /> Edytuj
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedAnimal(row.original)
                setOpenMedicalModal(true)
              }}
            >
              <Stethoscope className="w-4 h-4 mr-1" /> Medyczne
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedAnimal(row.original)
                setOpenEventsModal(true)
              }}
            >
              <Calendar className="w-4 h-4 mr-1" /> Wydarzenia
            </Button>
          </div>
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

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto px-4 md:px-0">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Input
          placeholder="Szukaj zwierząt..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm md:text-xl h-12"
        />

        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => {
              getReports()
            }}
          >
            Pobierz raport
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              getReportsDump()
            }}
          >
            Pobierz caly raport
          </Button>
          <Button
            disabled={selectedCount === 0}
            variant="outline"
            onClick={() => {
              console.log('Selected IDs:', selectedIds)
              if (selectedIds.length > 0) {
                getReportsBySelectedIds({ ids: selectedIds })
              }
            }}
          >
            Pobierz raport dla {selectedCount} zaznaczonych
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setOpenDateRangeModal(true)
            }}
          >
            Pobierz raport z zakresu dat
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
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {!isLoading ? (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      ) : (
                        <Skeleton className="h-10 w-full" />
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
            disabled={page === 1 || isLoading}
          >
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((i) => i + 1)}
            disabled={page === totalPages || isLoading}
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
