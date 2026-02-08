import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Eye, Pencil, Stethoscope } from 'lucide-react'
import AnimalViewTab from './tabs/AnimalViewTab'
import AnimalEditTab from './tabs/AnimalEditTab'
import AnimalMedicalNotesTab from './tabs/AnimalMedicalNotesTab'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import type { ColumnDef } from '@tanstack/react-table'
import type { Animal } from '@/api/animals/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { useAnimals } from '@/api/animals/queries'

interface AnimalTableProps {
  onGetSelectedIds?: (ids: Array<number>) => void
}

function AnimalTable({ onGetSelectedIds }: AnimalTableProps) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const { data: animalsPage, isLoading } = useAnimals({
    page: page,
    pageSize,
  })

  const [globalFilter, setGlobalFilter] = React.useState('')
  const [rowSelection, setRowSelection] = React.useState({})
  const [selectedAnimal, setSelectedAnimal] = React.useState<Animal | null>(
    null,
  )
  const [openViewModal, setOpenViewModal] = React.useState(false)
  const [openEditModal, setOpenEditModal] = React.useState(false)
  const [openMedicalModal, setOpenMedicalModal] = React.useState(false)

  const columns = React.useMemo<Array<ColumnDef<Animal, any>>>(
    () => [
      {
        id: 'select',
        header: () => null, // No select-all header, single row selection only.
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
        accessorKey: 'signature',
        header: 'Oznaczenie',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'name',
        header: 'Imię',
        cell: (info) => (
          <a href={`/animal/${info.row.original.id}`}>{info.getValue()}</a>
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
          const age = Math.floor(
            (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
          )
          return `${age} lat`
        },
        filterFn: 'includesString',
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: (info) => {
          const isActive = info.getValue() as boolean
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              }`}
            >
              {isActive ? 'Aktywny' : 'Nieaktywny'}
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
          return date.toLocaleDateString()
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
              variant="secondary"
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
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedAnimal(row.original)
                setOpenMedicalModal(true)
              }}
            >
              <Stethoscope className="w-4 h-4 mr-1" /> Medyczne
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
  }, [globalFilter])

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
    pageCount: Math.ceil(animalsPage?.totalCount || 9999),
  })

  const handleGetSelectedIds = () => {
    const selectedRows = table.getState().rowSelection
    const selectedIds = Object.keys(selectedRows).map((key) => Number(key))

    if (onGetSelectedIds) {
      onGetSelectedIds(selectedIds)
    } else {
      alert(`Selected animal IDs: ${selectedIds.join(', ')}`)
    }
  }

  const selectedCount = Object.keys(table.getState().rowSelection).length

  return (
    <div className="space-y-4 max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Input
          placeholder="Szukaj zwierząt..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm md:text-xl h-12"
        />

        <div className="flex gap-2 items-center">
          {selectedCount > 0 && (
            <>
              <span className="text-sm text-muted-foreground mr-2">
                {selectedCount} zaznaczono
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  table.resetRowSelection()
                }}
              >
                Wyczyść zaznaczenie
              </Button>
            </>
          )}
          <Button
            onClick={handleGetSelectedIds}
            disabled={selectedCount === 0}
            variant={selectedCount > 0 ? 'default' : 'outline'}
          >
            Pobierz zaznaczone ID
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
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
                    <td
                      key={cell.id}
                      className="px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0"
                    >
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
        <div className="flex items-center gap-4">
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
            disabled={pageSize === animalsPage?.totalCount}
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
        <AnimalEditTab
          animal={selectedAnimal}
          open={openEditModal && !!selectedAnimal}
          onClose={() => setOpenEditModal(false)}
        />
      )}

      {/* Medical Modal */}
      {selectedAnimal && (
        <AnimalMedicalNotesTab
          animalId={selectedAnimal.id}
          open={openMedicalModal && !!selectedAnimal}
          onClose={() => setOpenMedicalModal(false)}
        />
      )}
    </div>
  )
}

export default AnimalTable
