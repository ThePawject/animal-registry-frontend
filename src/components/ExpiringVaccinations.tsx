import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import VaccinationStatusBadge from './VaccinationStatusBadge'
import DisabledAddon from '@/components/DisabledAddon'
import { SPECIES_MAP } from '@/api/animals/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeature } from '@/api/features/queries'
import { useExpiringVaccinations } from '@/api/vaccinations/queries'
import { formatDate } from '@/lib/utils'

const MAX_DAYS = 3650
const DEFAULT_DAYS = 30
const CUSTOM_PERIOD = 'custom'

const EXPIRY_PERIODS = [
  { label: 'tygodnia', days: 7 },
  { label: '2 tygodni', days: 14 },
  { label: 'miesiąca', days: 30 },
  { label: '3 miesięcy', days: 90 },
  { label: 'pół roku', days: 180 },
]

export default function ExpiringVaccinations() {
  const { isEnabled, isLoading: isLoadingFeature } = useFeature(
    'animal-vaccinations',
  )
  const [days, setDays] = useState(String(DEFAULT_DAYS))
  const [isCustomPeriod, setIsCustomPeriod] = useState(false)
  const customDaysInputRef = useRef<HTMLInputElement>(null)
  const shouldFocusCustomDaysRef = useRef(false)
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
            <Label htmlFor="expiry-period">Wygasają w ciągu</Label>
            <Select
              value={isCustomPeriod ? CUSTOM_PERIOD : days}
              onValueChange={(value) => {
                setIsCustomPeriod(value === CUSTOM_PERIOD)
                shouldFocusCustomDaysRef.current = value === CUSTOM_PERIOD
                if (value !== CUSTOM_PERIOD) setDays(value)
              }}
            >
              <SelectTrigger
                id="expiry-period"
                size="sm"
                className="w-36 bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                onCloseAutoFocus={(e) => {
                  if (!shouldFocusCustomDaysRef.current) return
                  e.preventDefault()
                  shouldFocusCustomDaysRef.current = false
                  customDaysInputRef.current?.select()
                }}
              >
                {EXPIRY_PERIODS.map(({ label, days: periodDays }) => (
                  <SelectItem key={periodDays} value={String(periodDays)}>
                    {label}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_PERIOD}>wybór dni</SelectItem>
              </SelectContent>
            </Select>
            {isCustomPeriod && (
              <Input
                ref={customDaysInputRef}
                id="expires-in-days"
                aria-label="Wygasają w ciągu (dni)"
                type="number"
                min={0}
                max={MAX_DAYS}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="h-8 w-20 bg-background"
              />
            )}
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
