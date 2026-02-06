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
import type { Animal } from '@/data/animal-data'
import { mockAnimalApi } from '@/data/animal-data'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

interface AnimalTableProps {
  onGetSelectedIds?: (ids: Array<number>) => void
}

function AnimalTable({ onGetSelectedIds }: AnimalTableProps) {
  // MOCK API PAGINATION DATA STATE
  const [pageData, setPageData] = React.useState<Array<Animal>>([])
  const [total, setTotal] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

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
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => info.row.original.animalId,
      },
      {
        accessorKey: 'name',
        header: 'Imię',
        cell: (info) => (
          <a href={`/animal/${info.row.original.animalId}`}>
            {info.getValue()}
          </a>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Gatunek',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'breed',
        header: 'Rasa',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'age',
        header: 'Wiek',
        cell: (info) => `${info.getValue()} lat`,
        filterFn: 'includesString',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as string
          const statusColors = {
            available:
              'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
            adopted:
              'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
            pending:
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
            medical:
              'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
          }
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}
            >
              {status}
            </span>
          )
        },
        filterFn: 'includesString',
      },
      {
        accessorKey: 'admissionDate',
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

  // FETCH EFFECT for mock api
  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    mockAnimalApi({ page: pageIndex, pageSize, search: globalFilter }).then(
      (res) => {
        if (!cancelled) {
          setPageData(res.data)
          setTotal(res.total)
          setLoading(false)
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [globalFilter, pageIndex, pageSize])

  // Reset to first page on search change
  React.useEffect(() => {
    setPageIndex(0)
  }, [globalFilter])

  const table = useReactTable({
    data: pageData,
    columns,
    state: {
      globalFilter,
      rowSelection,
    },
    enableMultiRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row.animalId.toString(),
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
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
                      {!loading ? (
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
            onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
            disabled={pageIndex === 0 || loading}
          >
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPageIndex((i) =>
                Math.min(Math.ceil(total / pageSize) - 1, i + 1),
              )
            }
            disabled={pageIndex >= Math.ceil(total / pageSize) - 1 || loading}
          >
            Następna
          </Button>
        </div>
      </div>
      {/* View Modal */}
      {selectedAnimal && (
        <AnimalViewTab
          animal={selectedAnimal}
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
          animalId={selectedAnimal.animalId}
          open={openMedicalModal && !!selectedAnimal}
          onClose={() => setOpenMedicalModal(false)}
        />
      )}
    </div>
  )
}

export default AnimalTable
