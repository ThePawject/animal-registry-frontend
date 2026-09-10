import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type InfoCardProps = {
  infoOpen?: boolean
  setInfoOpen?: (open: boolean) => void
  className?: string
  iconClassName?: string
  children: ReactNode
}

export function InfoCard({
  infoOpen,
  setInfoOpen,
  className,
  iconClassName,
  children,
}: InfoCardProps) {
  return (
    <Popover open={infoOpen} onOpenChange={setInfoOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring',
            className,
          )}
          aria-label="Dodatkowe informacje"
        >
          <Info className={cn('size-8 text-blue-600', iconClassName)} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96" side="right" align="start">
        {children}
      </PopoverContent>
    </Popover>
  )
}
