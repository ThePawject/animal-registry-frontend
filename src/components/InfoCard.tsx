import { Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type InfoCardProps = {
  infoOpen?: boolean
  setInfoOpen?: (open: boolean) => void
  className?: string
  iconClassName?: string
  icon?: LucideIcon
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  children: ReactNode
}

export function InfoCard({
  infoOpen,
  setInfoOpen,
  className,
  iconClassName,
  icon: Icon = Info,
  side = 'right',
  align = 'start',
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
          <Icon className={cn('size-8 text-blue-600', iconClassName)} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96" side={side} align={align}>
        {children}
      </PopoverContent>
    </Popover>
  )
}
