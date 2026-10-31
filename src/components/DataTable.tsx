import { flexRender } from '@tanstack/react-table'
import type { ColumnDef, Table } from '@tanstack/react-table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, pinnedCellClass } from '@/lib/utils'
import { useHorizontalOverflow } from '@/hooks/useHorizontalOverflow'

interface DataTableProps<T> {
  table: Table<T>
  columns: Array<ColumnDef<T, any>>
  isPending: boolean
  isPlaceholderData: boolean
  pageSize: number
  emptyText?: string
}

export default function DataTable<T>({
  table,
  columns,
  isPending,
  isPlaceholderData,
  pageSize,
  emptyText = 'Brak wyników.',
}: DataTableProps<T>) {
  const { ref: scrollRef, hasOverflow } =
    useHorizontalOverflow<HTMLDivElement>()

  return (
    <div
      ref={scrollRef}
      aria-busy={isPending || isPlaceholderData}
      className={cn(
        'rounded-md border w-full overflow-x-auto transition-opacity',
        isPlaceholderData && 'opacity-60',
      )}
    >
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-muted">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'border-b bg-inherit px-4 py-3 text-left font-medium text-sm',
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
          {isPending ? (
            Array.from({ length: pageSize }).map((_, index) => (
              <tr key={`skeleton-${index}`} className="border-b bg-background">
                {columns.map((column, colIndex) => (
                  <td
                    key={`skeleton-cell-${colIndex}`}
                    className={cn(
                      'px-4 py-3',
                      pinnedCellClass(column.id, hasOverflow),
                    )}
                  >
                    <Skeleton className="h-10 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length ? (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
