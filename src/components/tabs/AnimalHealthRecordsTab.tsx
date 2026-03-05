import React from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useForm } from '@tanstack/react-form'
import { ErrorPopover } from '../ErrorPopover'
import AnimalHealthRecordForm from './AnimalHealthRecordForm'
import type { ColumnDef } from '@tanstack/react-table'
import type { AnimalById, AnimalHealthRecord } from '@/api/animals/types'
import {
  useDeleteAnimalHealthRecord,
  useEditAnimalHealthRecord,
} from '@/api/animals/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'

interface AnimalHealthRecordsTabProps {
  animal: AnimalById
}

const defaultEditFormData: Omit<AnimalHealthRecord, 'id'> = {
  occurredOn: new Date().toISOString().split('T')[0],
  description: '',
  performedBy: '',
}

export default function AnimalHealthRecordsTab({
  animal,
}: AnimalHealthRecordsTabProps) {
  const { mutate: deleteRecord, isPending: isDeleting } =
    useDeleteAnimalHealthRecord()
  const { mutate: editRecord, isPending: isEditingRecord } =
    useEditAnimalHealthRecord()

  const [editingRecordId, setEditingRecordId] = React.useState<string | null>(
    null,
  )
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [recordToDelete, setRecordToDelete] =
    React.useState<AnimalHealthRecord | null>(null)

  const form = useForm({
    defaultValues: defaultEditFormData,
    onSubmit: ({ value }) => {
      const recordData: AnimalHealthRecord = {
        id: editingRecordId!,
        ...value,
      }

      editRecord(
        { animalId: animal.id, recordId: editingRecordId!, data: recordData },
        {
          onSuccess: () => {
            setEditingRecordId(null)
            form.reset()
          },
        },
      )
    },
  })

  const healthRecords = animal.healthRecords

  const handleEditClick = (record: AnimalHealthRecord) => {
    setEditingRecordId(record.id)
    form.setFieldValue('occurredOn', record.occurredOn.split('T')[0], {
      dontValidate: true,
    })
    form.setFieldValue('description', record.description, {
      dontValidate: true,
    })
    form.setFieldValue('performedBy', record.performedBy || '', {
      dontValidate: true,
    })
  }

  const handleCancelEdit = () => {
    setEditingRecordId(null)
    form.setFieldValue('occurredOn', defaultEditFormData.occurredOn)
    form.setFieldValue('description', defaultEditFormData.description)
    form.setFieldValue('performedBy', defaultEditFormData.performedBy)
  }

  const handleShowAddForm = () => {
    setEditingRecordId(null)
    form.setFieldValue('occurredOn', defaultEditFormData.occurredOn, {
      dontValidate: true,
    })
    form.setFieldValue('description', defaultEditFormData.description, {
      dontValidate: true,
    })
    form.setFieldValue('performedBy', defaultEditFormData.performedBy, {
      dontValidate: true,
    })
    setShowAddForm(true)
  }

  const handleCloseAddForm = () => {
    setShowAddForm(false)
  }

  const RecordDateCell = ({ record }: { record: AnimalHealthRecord }) => {
    if (editingRecordId === record.id) {
      return (
        <div className="min-w-[140px]">
          <form.Field
            name="occurredOn"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Data jest wymagana'
                const recordDate = new Date(value)
                const today = new Date()
                if (recordDate > today) return 'Data nie może być z przyszłości'
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
                    id="Data"
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
        {new Date(record.occurredOn).toLocaleDateString('pl-PL')}
      </span>
    )
  }

  const RecordDescriptionCell = ({
    record,
  }: {
    record: AnimalHealthRecord
  }) => {
    if (editingRecordId === record.id) {
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
                className="bg-background wrap-anywhere min-h-0 w-fit min-w-[300px]"
                placeholder="Wpisz opis"
              />
            )
          }}
        />
      )
    }

    return <div>{record.description}</div>
  }

  const RecordPerformedByCell = ({
    record,
  }: {
    record: AnimalHealthRecord
  }) => {
    return <div>{record.performedBy || ''}</div>
  }

  const handleDeleteClick = (record: AnimalHealthRecord) => {
    setRecordToDelete(record)
  }

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      deleteRecord({
        animalId: animal.id,
        recordId: recordToDelete.id,
      })
      setRecordToDelete(null)
    }
  }

  const columns = React.useMemo<Array<ColumnDef<AnimalHealthRecord, any>>>(
    () => [
      {
        accessorKey: 'occurredOn',
        header: () => <div className="w-max">Data</div>,
        cell: ({ row }) => <RecordDateCell record={row.original} />,
        size: 140,
      },
      {
        accessorKey: 'description',
        header: 'Opis',
        cell: ({ row }) => <RecordDescriptionCell record={row.original} />,
        size: 300,
      },
      {
        accessorKey: 'performedBy',
        header: () => <div className="w-max">Wykonane przez</div>,
        cell: ({ row }) => <RecordPerformedByCell record={row.original} />,
        size: 180,
      },
      {
        id: 'actions',
        header: 'Akcje',
        cell: ({ row }) => {
          const isEditing = editingRecordId === row.original.id

          if (isEditing) {
            return (
              <div className="flex gap-2 min-w-[200px] min-h-16 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8 flex-1"
                >
                  <X className="w-4 h-4 mr-1" /> Anuluj
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isEditingRecord}
                  onClick={() => form.handleSubmit()}
                  className="h-8 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white"
                >
                  <Check className="w-4 h-4 mr-1" />{' '}
                  {isEditingRecord ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
              </div>
            )
          }

          return (
            <div className="flex gap-2 min-w-[200px] min-h-16 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditClick(row.original)}
                className="h-8 flex-1"
              >
                <Pencil className="w-4 h-4 mr-1" /> Edytuj
              </Button>
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => handleDeleteClick(row.original)}
                disabled={isDeleting}
                className="h-8 flex-1"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Usuń
              </Button>
            </div>
          )
        },
        enableSorting: false,
        enableHiding: false,
        size: 220,
      },
    ],
    [editingRecordId, isDeleting],
  )

  const table = useReactTable({
    data: healthRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <Card className="max-w-full w-full p-8 rounded-2xl shadow-md bg-white dark:bg-zinc-900">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Karty zdrowia</h2>

          <Button
            onClick={handleShowAddForm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="size-5" /> Dodaj kartę zdrowia
          </Button>
        </div>

        <div className="space-y-6 w-full flex flex-col gap-8">
          {showAddForm && (
            <div className="w-full">
              <AnimalHealthRecordForm
                animalId={animal.id}
                onClose={handleCloseAddForm}
              />
            </div>
          )}

          <div className="rounded-md border bg-white dark:bg-black/30 overflow-x-auto m-0">
            <table className="text-sm min-w-[600px] w-full">
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
                {healthRecords.length === 0 ? (
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
                        <td key={cell.id} className="px-4 py-3 align-middle">
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
        open={!!recordToDelete}
        onOpenChange={(open) => {
          if (!open) setRecordToDelete(null)
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
