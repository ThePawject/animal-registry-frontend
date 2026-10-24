import { Upload, X } from 'lucide-react'
import { ALLOWED_DOCUMENT_EXTENSIONS } from '@/api/animals/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DocumentPickerProps {
  fileName: string | null
  hasError?: boolean
  onSelect: (file: File) => void
  onClear: () => void
}

export default function DocumentPicker({
  fileName,
  hasError,
  onSelect,
  onClear,
}: DocumentPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1 min-w-0 cursor-pointer">
        <input
          type="file"
          accept={ALLOWED_DOCUMENT_EXTENSIONS}
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) onSelect(file)
          }}
          className="hidden"
        />
        <div
          className={cn(
            'flex items-center justify-center w-full h-10 px-4 border-2 border-dashed rounded-lg transition-colors',
            hasError
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400',
          )}
        >
          <Upload className="w-4 h-4 mr-2 shrink-0" />
          <span
            className={cn(
              'text-sm truncate',
              hasError ? 'text-red-600' : 'text-gray-500',
            )}
          >
            {fileName ??
              'Wybierz plik (PDF, DOC, DOCX, JPEG, PNG, WEBP - max 10MB)'}
          </span>
        </div>
      </label>
      {fileName && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Usuń plik"
          className="h-10 w-10 p-0 bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600"
          onClick={onClear}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
