import { cn } from '@/lib/utils'

export default function AnimalShelterStatusBadge({
  isInShelter,
}: {
  isInShelter: boolean
}) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-1 text-xs font-medium',
        isInShelter
          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      )}
    >
      {isInShelter ? 'W schronisku' : 'Poza schroniskiem'}
    </span>
  )
}
