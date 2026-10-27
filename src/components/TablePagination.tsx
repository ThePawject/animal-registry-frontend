import { ChevronFirst, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TablePaginationProps<TPageSize extends number> {
  page: number
  pageSize: TPageSize
  totalPages: number
  disabled: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: TPageSize) => void
}

export default function TablePagination<TPageSize extends 10 | 20 | 50>({
  page,
  pageSize,
  totalPages,
  disabled,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps<TPageSize>) {
  return (
    <div className="flex items-center justify-end space-x-2 py-2">
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-semibold">Wierszy na stronę:</label>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) =>
            onPageSizeChange(Number(value) as TPageSize)
          }
        >
          <SelectTrigger
            aria-label="Wierszy na stronę"
            className="w-[80px] bg-white"
          >
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
        <span className="text-sm font-semibold">
          Strona {page} z {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || disabled}
            aria-label="Pierwsza strona"
            onClick={() => onPageChange(1)}
          >
            <ChevronFirst className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Poprzednia strona"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1 || disabled}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Następna strona"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || disabled}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label="Ostatnia strona"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages || disabled}
          >
            <ChevronFirst className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  )
}
