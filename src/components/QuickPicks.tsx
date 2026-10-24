import { cn } from '@/lib/utils'

export type QuickPick<T> = {
  label: string
  value: T
}

interface QuickPicksProps<T> {
  label: string
  options: Array<QuickPick<T>>
  selected?: T | null
  disabled?: boolean
  onSelect: (value: T) => void
}

export default function QuickPicks<T>({
  label,
  options,
  selected,
  disabled,
  onSelect,
}: QuickPicksProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isSelected = option.value === selected
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onSelect(option.value)}
            className={cn(
              'rounded-full border px-2.5 py-px text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
              isSelected
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-300 bg-background text-slate-600 hover:border-emerald-600 hover:text-emerald-700',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
