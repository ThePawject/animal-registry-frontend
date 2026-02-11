import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Pencil, Trash2, XIcon } from 'lucide-react'
import AnimalEventFormModal from './AnimalEventFormModal'
import type { ColumnDef } from '@tanstack/react-table'
import type { AnimalEvent } from '@/api/animals/types'
import { ANIMAL_EVENT_TYPE_MAP } from '@/api/animals/types'
import { useAnimalById, useDeleteAnimalEvent } from '@/api/animals/queries'
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

interface AnimalEventsTabProps {
  animalId: string
  open: boolean
  onClose: () => void
}

export default function AnimalEventsTab({
  animalId,
  open,
  onClose,
}: AnimalEventsTabProps) {
  const { data: animal, isLoading } = useAnimalById(animalId)
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteAnimalEvent()

  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false)
  const [selectedEvent, setSelectedEvent] = React.useState<AnimalEvent | null>(
    null,
  )
  const [eventToDelete, setEventToDelete] = React.useState<AnimalEvent | null>(
    null,
  )

  const events = animal?.events || []

  const handleEdit = (event: AnimalEvent) => {
    setSelectedEvent(event)
    setIsFormModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedEvent(null)
    setIsFormModalOpen(true)
  }

  const handleDeleteClick = (event: AnimalEvent) => {
    setEventToDelete(event)
  }

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteEvent({
        animalId: animalId,
        eventId: eventToDelete.id,
      })
      setEventToDelete(null)
    }
  }

  const columns = React.useMemo<Array<ColumnDef<AnimalEvent, any>>>(
    () => [
      {
        accessorKey: 'type',
        header: 'Typ wydarzenia',
        cell: (info) => {
          const type = info.getValue() as number
          return ANIMAL_EVENT_TYPE_MAP[
            type as keyof typeof ANIMAL_EVENT_TYPE_MAP
          ]
        },
      },
      {
        accessorKey: 'occurredOn',
        header: 'Data wydarzenia',
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
    data: events,
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
          className="p-0 bg-transparent shadow-none border-none max-w-4xl"
        >
          <div className="relative">
            <DialogClose asChild>
              <button
                onClick={onClose}
                className="absolute z-10 top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none bg-white dark:bg-zinc-900 p-2"
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </DialogClose>

            <Card className="max-w-full w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Wydarzenia</h2>
              </div>

              <div className="space-y-6 w-max mx-auto">
                <Button
                  onClick={handleAdd}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto block"
                >
                  Dodaj wydarzenie
                </Button>
                <div className="rounded-md border bg-white dark:bg-black/30 overflow-x-auto max-w-[700px]">
                  <table className="text-sm min-w-[600px]">
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
                      ) : events.length === 0 ? (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="h-20 text-center text-muted-foreground"
                          >
                            Brak wydarzeń.
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
      <AnimalEventFormModal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false)
          setSelectedEvent(null)
        }}
        animalId={animalId}
        event={selectedEvent}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!eventToDelete}
        onOpenChange={(open) => {
          if (!open) setEventToDelete(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć to wydarzenie? Tej operacji nie można
              cofnąć.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setEventToDelete(null)}
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
