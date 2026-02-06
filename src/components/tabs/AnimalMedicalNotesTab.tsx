import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Note {
  id: number
  note: string
  date: string
}

import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { XIcon } from 'lucide-react'

export default function AnimalMedicalNotesTab({
  animalId: _animalId,
  open,
  onClose,
}: {
  animalId: number
  open: boolean
  onClose: () => void
}) {
  const [notes, setNotes] = React.useState<Note[]>([])
  const [newNote, setNewNote] = React.useState('')
  const [newDate, setNewDate] = React.useState('')

  const handleAdd = () => {
    if (!newNote || !newDate) return
    setNotes((n) => [...n, { id: Date.now(), note: newNote, date: newDate }])
    setNewNote('')
    setNewDate('')
  }
  const handleRemove = (id: number) =>
    setNotes((ns) => ns.filter((n) => n.id !== id))

  const columns = React.useMemo<ColumnDef<Note, any>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => info.getValue(),
        size: 80,
      },
      {
        accessorKey: 'note',
        header: 'Notatka',
        cell: (info) => (
          <span className="max-w-xs break-words block">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Data',
        cell: (info) => {
          // Format date as local string if possible
          const value = info.getValue() as string
          return value ? new Date(value).toLocaleDateString() : ''
        },
        size: 120,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleRemove(row.original.id)}
            className="sm:min-w-[120px] min-w-full"
          >
            Usuń notatkę
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 130,
      },
    ],
    [],
  )

  const table = useReactTable({
    data: notes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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
          <DialogClose asChild>
            <button
              onClick={onClose}
              className="absolute z-10 top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:outline-none bg-white dark:bg-zinc-900 p-2"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </DialogClose>

          <Card className="max-w-3xl w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Notatki medyczne</h2>
            </div>

            <div className="space-y-6 max-w-full w-full">
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
                    {notes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="h-20 text-center text-muted-foreground"
                        >
                          Brak notatek.
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
              <form
                className="flex flex-wrap gap-4 items-end"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAdd()
                }}
              >
                <div className="w-full sm:w-auto flex-1 min-w-[200px]">
                  <label className="block font-semibold mb-2 text-sm">
                    Notatka
                  </label>
                  <Input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Notatka medyczna..."
                    className="text-sm"
                    maxLength={400}
                  />
                </div>
                <div className="w-full sm:w-auto flex-1 min-w-[160px] max-w-[160px]">
                  <label className="block font-semibold mb-2 text-sm">
                    Data
                  </label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  className="font-semibold px-8 py-2"
                  disabled={!newNote || !newDate}
                >
                  Dodaj notatkę
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
