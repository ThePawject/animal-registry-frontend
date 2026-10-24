import type { VaccinationStatus } from '@/api/vaccinations/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const EXPIRING_SOON_DAYS = 30

interface VaccinationStatusBadgeProps {
  status: VaccinationStatus
  daysUntilExpiry: number | null
}

export default function VaccinationStatusBadge({
  status,
  daysUntilExpiry,
}: VaccinationStatusBadgeProps) {
  if (status === 3) {
    return <Badge variant="secondary">Zastąpione nowszym</Badge>
  }

  if (daysUntilExpiry === null) {
    return <Badge variant="secondary">Bez terminu ważności</Badge>
  }

  if (daysUntilExpiry < 0) {
    return <Badge className="bg-red-50 text-red-600">Wygasło</Badge>
  }

  const label =
    daysUntilExpiry === 0
      ? 'Wygasa dzisiaj'
      : daysUntilExpiry === 1
        ? 'Wygasa jutro'
        : `Wygasa za ${daysUntilExpiry} dni`

  return (
    <Badge
      className={cn(
        daysUntilExpiry <= EXPIRING_SOON_DAYS
          ? 'bg-amber-50 text-amber-700'
          : 'bg-emerald-50 text-emerald-600',
      )}
    >
      {daysUntilExpiry <= EXPIRING_SOON_DAYS ? label : 'Ważne'}
    </Badge>
  )
}
