import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { ErrorPopover } from '../ErrorPopover'
import {
  SortableHeader,
  getAriaSort,
  sortByDate,
  sortByMappedText,
  sortByText,
} from '../SortableHeader'
import AnimalEventForm from './AnimalEventForm'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type {
  AnimalById,
  AnimalEvent,
  AnimalEventType,
} from '@/api/animals/types'
import { ANIMAL_EVENT_TYPE_MAP, EVENT_TYPE_OPTIONS } from '@/api/animals/types'
import { useDeleteAnimalEvent, useEditAnimalEvent } from '@/api/animals/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import {
  PINNED_COLUMN_ID,
  cn,
  isFutureDate,
  pinnedCellClass,
  todayIsoDate,
} from '@/lib/utils'
import { useHorizontalOverflow } from '@/hooks/useHorizontalOverflow'

interface AnimalEventsTabProps {
  animal: AnimalById
}

const ACTIONS_COLUMN_WIDTH = 240
const ACTIONS_WIDTH_SAVED = 120

const sortByEventType = sortByMappedText<AnimalEvent>(ANIMAL_EVENT_TYPE_MAP)

const createDefaultEditFormData = (): Omit<AnimalEvent, 'id'> => ({
  type: 1,
  occurredOn: todayIsoDate(),
  description: '',
})

export default function AnimalEventsTab({ animal }: AnimalEventsTabProps) {
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteAnimalEvent()
  const { mutate: editEvent, isPending: isEditingEvent } = useEditAnimalEvent()

  const [editingEventId, setEditingEventId] = React.useState<string | null>(
    null,
  )
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [eventToDelete, setEventToDelete] = React.useState<AnimalEvent | null>(
    null,
  )

  const form = useForm({
    defaultValues: createDefaultEditFormData(),
    onSubmit: ({ value }) => {
      const eventData: AnimalEvent = {
        id: editingEventId!,
        ...value,
      }

      editEvent(
        { animalId: animal.id, eventId: editingEventId!, data: eventData },
        {
          onSuccess: () => {
            setEditingEventId(null)
            form.reset()
          },
        },
      )
    },
  })

  const events = animal.events

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'occurredOn', desc: true },
  ])
  const { ref: scrollRef, hasOverflow } =
    useHorizontalOverflow<HTMLDivElement>()

  const handleEditClick = (event: AnimalEvent) => {
    setEditingEventId(event.id)
    form.setFieldValue('type', event.type, { dontValidate: true })
    form.setFieldValue('occurredOn', event.occurredOn.split('T')[0], {
      dontValidate: true,
    })
    form.setFieldValue('description', event.description, { dontValidate: true })
  }

  const handleCancelEdit = () => {
    const defaults = createDefaultEditFormData()
    setEditingEventId(null)
    form.setFieldValue('type', defaults.type)
    form.setFieldValue('occurredOn', defaults.occurredOn)
    form.setFieldValue('description', defaults.description)
  }

  const handleShowAddForm = () => {
    const defaults = createDefaultEditFormData()
    setEditingEventId(null)
    form.setFieldValue('type', defaults.type, {
      dontValidate: true,
    })
    form.setFieldValue('occurredOn', defaults.occurredOn, {
      dontValidate: true,
    })
    form.setFieldValue('description', defaults.description, {
      dontValidate: true,
    })
    setShowAddForm(true)
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
  }

  const EventTypeCell = ({ event }: { event: AnimalEvent }) => {
    if (editingEventId === event.id) {
      return (
        <form.Field
          name="type"
          validators={{
            onChange: ({ value }) => {
              return value === 0 ? 'Typ wydarzenia jest wymagany' : undefined
            },
          }}
          children={(field) => {
            return (
              <div className="flex-1 flex justify-center">
                <Select
                  value={String(field.state.value)}
                  onValueChange={(value) =>
                    field.handleChange(Number(value) as AnimalEventType)
                  }
                >
                  <SelectTrigger className="bg-background w-full">
                    <SelectValue placeholder="Wybierz typ wydarzenia" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPE_OPTIONS.filter((opt) => opt.value !== 0).map(
                      (opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>

                <ErrorPopover error={field.state.meta.errors[0]} />
              </div>
            )
          }}
        />
      )
    }

    return <div>{ANIMAL_EVENT_TYPE_MAP[event.type]}</div>
  }

  const EventDateCell = ({ event }: { event: AnimalEvent }) => {
    if (editingEventId === event.id) {
      return (
        <div className="w-full">
          <form.Field
            name="occurredOn"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Data wydarzenia jest wymagana'
                if (isFutureDate(value))
                  return 'Data wydarzenia nie może być z przyszłości'
                return undefined
              },
            }}
            children={(field) => {
              return (
                <div className="flex-1">
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    id="Data wydarzenia"
                    className="bg-background"
                  />
                  <ErrorPopover error={field.state.meta.errors[0]} />
                </div>
              )
            }}
          />
        </div>
      )
    }

    return (
      <span className="block w-full">
        {new Date(event.occurredOn).toLocaleDateString('pl-PL')}
      </span>
    )
  }

  const EventDescriptionCell = ({ event }: { event: AnimalEvent }) => {
    if (editingEventId === event.id) {
      return (
        <form.Field
          name="description"
          validators={{
            onChange: ({ value }) => {
              return !value || value.trim().length < 1
                ? 'Opis jest wymagany'
                : undefined
            },
          }}
          children={(field) => {
            return (
              <Textarea
                maxLength={500}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                id="Opis"
                className="bg-background wrap-anywhere min-h-0 w-full"
                placeholder="Wpisz opis"
              />
            )
          }}
        />
      )
    }

    return <div>{event.description}</div>
  }

  const EventPerformedByCell = ({ event }: { event: AnimalEvent }) => {
    return <div>{event.performedBy || ''}</div>
  }

  const handleDeleteClick = (event: AnimalEvent) => {
    setEventToDelete(event)
  }

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      deleteEvent({
        animalId: animal.id,
        eventId: eventToDelete.id,
      })
      setEventToDelete(null)
    }
  }

  const columns = React.useMemo<Array<ColumnDef<AnimalEvent, any>>>(
    () => [
      {
        accessorKey: 'occurredOn',
        header: ({ column }) => (
          <SortableHeader column={column}>Data wydarzenia</SortableHeader>
        ),
        cell: ({ row }) => <EventDateCell event={row.original} />,
        sortingFn: sortByDate,
        sortDescFirst: true,
        size: 170,
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <SortableHeader column={column}>Typ wydarzenia</SortableHeader>
        ),
        cell: ({ row }) => <EventTypeCell event={row.original} />,
        sortingFn: sortByEventType,
        sortDescFirst: false,
        size: 220,
      },
      {
        accessorKey: 'description',
        header: 'Opis',
        cell: ({ row }) => <EventDescriptionCell event={row.original} />,
        enableSorting: false,
        size: 340,
      },
      {
        accessorKey: 'performedBy',
        header: ({ column }) => (
          <SortableHeader column={column}>Wykonane przez</SortableHeader>
        ),
        cell: ({ row }) => <EventPerformedByCell event={row.original} />,
        sortingFn: sortByText,
        sortDescFirst: false,
        size: 190,
      },
      {
        id: 'actions',
        header: 'Akcje',
        cell: ({ row }) => {
          const isEditing = editingEventId === row.original.id

          if (isEditing) {
            return (
              <div className="flex gap-2 w-full min-h-16 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8 md:flex-1"
                >
                  <X className="w-4 h-4 md:mr-1" />
                  <span className="sr-only md:not-sr-only">Anuluj</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isEditingEvent}
                  onClick={() => form.handleSubmit()}
                  className="h-8 md:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white"
                >
                  <Check className="w-4 h-4 md:mr-1" />
                  <span className="sr-only md:not-sr-only">
                    {isEditingEvent ? 'Zapisywanie...' : 'Zapisz'}
                  </span>
                </Button>
              </div>
            )
          }

          return (
            <div className="flex gap-2 w-full min-h-16 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(row.original)}
                className="h-8 md:flex-1"
              >
                <Pencil className="w-4 h-4 md:mr-1" />
                <span className="sr-only md:not-sr-only">Edytuj</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => handleDeleteClick(row.original)}
                disabled={isDeleting}
                className="h-8 md:flex-1"
              >
                <Trash2 className="w-4 h-4 md:mr-1" />
                <span className="sr-only md:not-sr-only">Usuń</span>
              </Button>
            </div>
          )
        },
        enableSorting: false,
        enableHiding: false,
        size: ACTIONS_COLUMN_WIDTH,
      },
    ],
    [editingEventId, isDeleting],
  )

  const table = useReactTable({
    data: events,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <Card className="max-w-full w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Wydarzenia</h2>

          <Button
            onClick={handleShowAddForm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="size-5" /> Dodaj wydarzenie
          </Button>
        </div>

        <div className="space-y-6 w-full flex flex-col gap-8">
          {showAddForm && (
            <div className="w-full">
              <AnimalEventForm
                animalId={animal.id}
                onClose={handleCloseAddForm}
              />
            </div>
          )}

          <div
            ref={scrollRef}
            className="rounded-md border bg-white dark:bg-black/30 overflow-x-auto m-0"
          >
            <table
              className="text-sm w-full table-fixed min-w-[var(--table-narrow)] md:min-w-[var(--table-wide)]"
              style={
                {
                  '--table-wide': `${table.getTotalSize()}px`,
                  '--table-narrow': `${table.getTotalSize() - ACTIONS_WIDTH_SAVED}px`,
                } as React.CSSProperties
              }
            >
              <colgroup>
                {table.getAllLeafColumns().map((column) => (
                  <col
                    key={column.id}
                    className={
                      column.id === PINNED_COLUMN_ID
                        ? 'w-30 md:w-60'
                        : undefined
                    }
                    style={
                      column.id === PINNED_COLUMN_ID
                        ? undefined
                        : { width: column.getSize() }
                    }
                  />
                ))}
              </colgroup>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-muted">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        aria-sort={getAriaSort(header.column)}
                        className={cn(
                          'border-b bg-inherit px-4 py-3 text-left font-semibold text-sm',
                          pinnedCellClass(header.column.id, hasOverflow),
                        )}
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
                {events.length === 0 ? (
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
                      className="border-b bg-background transition-colors hover:bg-muted"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={cn(
                            'px-4 py-3 align-middle',
                            pinnedCellClass(cell.column.id, hasOverflow),
                          )}
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
