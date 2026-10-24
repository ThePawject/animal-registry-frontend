import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import VaccinationStatusBadge from './VaccinationStatusBadge'
import DisabledAddon from '@/components/DisabledAddon'
import { SPECIES_MAP } from '@/api/animals/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeature } from '@/api/features/queries'
import { useExpiringVaccinations } from '@/api/vaccinations/queries'
import { formatDate } from '@/lib/utils'

const MAX_DAYS = 3650

export default function ExpiringVaccinations() {
  const { isEnabled, isLoading: isLoadingFeature } = useFeature(
    'animal-vaccinations',
  )
  const [days, setDays] = useState('30')
  const [includeExpired, setIncludeExpired] = useState(false)
  const [inShelterOnly, setInShelterOnly] = useState(true)

  const expiresInDays = Number(days)
  const isDaysValid =
    days !== '' &&
    Number.isInteger(expiresInDays) &&
    expiresInDays >= 0 &&
    expiresInDays <= MAX_DAYS

  const { data, isLoading, isError } = useExpiringVaccinations(
    { expiresInDays, includeExpired, inShelterOnly },
    isEnabled && isDaysValid,
  )

  if (isLoadingFeature) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!isEnabled) {
    return <DisabledAddon name="Szczepienia" addonKey="animal-vaccinations" />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <CardTitle>Terminy szczepień</CardTitle>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Label htmlFor="expires-in-days">Wygasają w ciągu (dni)</Label>
            <Input
              id="expires-in-days"
              type="number"
              min={0}
              max={MAX_DAYS}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-24 bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-expired"
              checked={includeExpired}
              onCheckedChange={(checked) => setIncludeExpired(checked === true)}
            />
            <Label htmlFor="include-expired">Pokaż już wygasłe</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-shelter-only"
              checked={inShelterOnly}
              onCheckedChange={(checked) => setInShelterOnly(checked === true)}
            />
            <Label htmlFor="in-shelter-only">
              Tylko zwierzęta w schronisku
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent role="list" className="flex flex-col gap-2">
        {!isDaysValid && (
          <p role="alert" className="text-sm text-red-500 font-medium">
            Liczba dni musi być z zakresu od 0 do {MAX_DAYS}.
          </p>
        )}
        {isDaysValid && isLoading && <Skeleton className="h-20 w-full" />}
        {isDaysValid && isError && <p>Nie udało się pobrać listy szczepień.</p>}
        {isDaysValid && data?.length === 0 && (
          <p className="text-muted-foreground">
            Brak szczepień spełniających kryteria.
          </p>
        )}
        {isDaysValid &&
          data?.map(({ vaccination, animalName, animalSignature, species }) => (
            <div
              key={vaccination.id}
              role="listitem"
              className="flex flex-wrap items-center justify-between gap-4 rounded-md border p-3"
            >
              <div className="flex flex-col gap-1">
                <Link
                  to="/animal/$animalId/vaccinations"
                  params={{ animalId: vaccination.animalId }}
                  className="font-semibold hover:underline"
                >
                  {animalName || 'Brak imienia'} ({animalSignature})
                </Link>
                <span className="text-sm text-muted-foreground">
                  {SPECIES_MAP[species]} · {vaccination.vaccineName}
                  {vaccination.validUntil &&
                    ` · ważne do ${formatDate(vaccination.validUntil)}`}
                </span>
              </div>
              <VaccinationStatusBadge
                status={vaccination.status}
                daysUntilExpiry={vaccination.daysUntilExpiry}
              />
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
