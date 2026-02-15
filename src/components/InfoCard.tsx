import { Info } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
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
    <HoverCard
      openDelay={100}
      closeDelay={200}
      open={infoOpen}
      onOpenChange={setInfoOpen}
    >
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => setInfoOpen?.(!infoOpen)}
          className={cn(
            'p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring',
            className,
          )}
          aria-label="Dodatkowe informacje"
        >
          <Info className={cn('size-8 text-blue-600', iconClassName)} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-96" side="right" align="start">
        {children}
      </HoverCardContent>
    </HoverCard>
  )
}
