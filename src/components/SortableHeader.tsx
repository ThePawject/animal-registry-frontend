import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { Column, Row } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

const SORT_ICONS = {
  asc: ArrowUp,
  desc: ArrowDown,
} as const

function timeValue(value: unknown) {
  const time = new Date(value as string).getTime()
  return Number.isNaN(time) ? 0 : time
}

export function sortByDate<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string,
) {
  return timeValue(rowA.getValue(columnId)) - timeValue(rowB.getValue(columnId))
}

const collator = new Intl.Collator('pl', { numeric: true, sensitivity: 'base' })

export function compareText(a: string, b: string) {
  return collator.compare(a, b)
}

export function sortByText<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string,
) {
  return compareText(
    rowA.getValue<string | undefined>(columnId) ?? '',
    rowB.getValue<string | undefined>(columnId) ?? '',
  )
}

export function sortByMappedText<TData>(labels: Record<number, string>) {
  return (rowA: Row<TData>, rowB: Row<TData>, columnId: string) =>
    compareText(
      labels[rowA.getValue<number>(columnId)] ?? '',
      labels[rowB.getValue<number>(columnId)] ?? '',
    )
}

export function getAriaSort<TData, TValue>(column: Column<TData, TValue>) {
  if (!column.getCanSort()) return undefined
  const sorted = column.getIsSorted()
  if (sorted === 'asc') return 'ascending'
  if (sorted === 'desc') return 'descending'
  return 'none'
}

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  children: React.ReactNode
}

export function SortableHeader<TData, TValue>({
  column,
  children,
}: SortableHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted()
  const Icon = sorted ? SORT_ICONS[sorted] : ArrowUpDown

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="flex w-max cursor-pointer items-center gap-1.5 font-semibold hover:text-emerald-700"
    >
      {children}
      <Icon
        aria-hidden
        className={cn(
          'size-3.5 shrink-0',
          sorted ? 'text-emerald-600' : 'text-muted-foreground',
        )}
      />
      <span className="sr-only">
        {sorted === 'asc'
          ? 'Sortowanie rosnąco, kliknij aby posortować malejąco'
          : 'Sortowanie malejąco, kliknij aby posortować rosnąco'}
      </span>
    </button>
  )
}
