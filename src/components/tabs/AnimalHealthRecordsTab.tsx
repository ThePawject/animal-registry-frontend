import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Pencil, Trash2, XIcon } from 'lucide-react'
import AnimalHealthRecordFormModal from './AnimalHealthRecordFormModal'
import type { ColumnDef } from '@tanstack/react-table'
import type { AnimalHealthRecord } from '@/api/animals/types'
import {
  useAnimalById,
  useDeleteAnimalHealthRecord,
} from '@/api/animals/queries'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'

interface AnimalHealthRecordsTabProps {
  animalId: string
  open: boolean
  onClose: () => void
}

export default function AnimalHealthRecordsTab({
  animalId,
  open,
  onClose,
}: AnimalHealthRecordsTabProps) {
  const { data: animal, isLoading } = useAnimalById(animalId)
  const { mutate: deleteRecord, isPending: isDeleting } =
    useDeleteAnimalHealthRecord()

  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false)
  const [selectedRecord, setSelectedRecord] =
    React.useState<AnimalHealthRecord | null>(null)
  const [recordToDelete, setRecordToDelete] =
    React.useState<AnimalHealthRecord | null>(null)

  const healthRecords = animal?.healthRecords || []

  const handleEdit = (record: AnimalHealthRecord) => {
    setSelectedRecord(record)
    setIsFormModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedRecord(null)
    setIsFormModalOpen(true)
  }

  const handleDeleteClick = (record: AnimalHealthRecord) => {
    setRecordToDelete(record)
  }

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteRecord({
        animalId: animalId,
        recordId: recordToDelete.id,
      })
      setRecordToDelete(null)
    }
  }

  const columns = React.useMemo<Array<ColumnDef<AnimalHealthRecord, any>>>(
    () => [
      {
        accessorKey: 'occurredOn',
        header: 'Data',
        cell: (info) => {
          const value = info.getValue() as string
          return value ? new Date(value).toLocaleDateString('pl-PL') : ''
        },
        size: 140,
      },
      {
        accessorKey: 'description',
        header: 'Opis',
        cell: (info) => (
          <span className="max-w-xs break-words block">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'performedBy',
        header: 'Wykonane przez',
        cell: (info) => info.getValue(),
      },
      {
        id: 'actions',
        header: 'Akcje',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Pencil className="w-4 h-4 mr-1" /> Edytuj
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(row.original)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Usuń
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 200,
      },
    ],
    [isDeleting],
  )

  const table = useReactTable({
    data: healthRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(openState) => {
          if (!openState) onClose()
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="bg-transparent shadow-none border-none max-w-fit p-4 md:min-w-[800px]"
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

            <Card className="max-w-5xl w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Karty zdrowia</h2>
              </div>

              <div className="space-y-6 max-w-full w-full">
                <Button
                  onClick={handleAdd}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto block"
                >
                  Dodaj kartę zdrowia
                </Button>
                <div className="rounded-md border bg-white dark:bg-black/30 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="border-b bg-muted/50 px-4 py-3 text-left font-semibold text-sm"
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
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="h-20 text-center text-muted-foreground"
                          >
                            Ładowanie...
                          </td>
                        </tr>
                      ) : healthRecords.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="h-20 text-center text-muted-foreground"
                          >
                            Brak kart zdrowia.
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b transition-colors hover:bg-muted/50"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-4 py-3 align-middle"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                )}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Modal for Add/Edit */}
      <AnimalHealthRecordFormModal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedRecord(null)
        }}
        animalId={animalId}
        record={selectedRecord}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!recordToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setRecordToDelete(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę kartę zdrowia? Tej operacji nie
              można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setRecordToDelete(null)}
              disabled={isDeleting}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Usuwanie...' : 'Usuń'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
