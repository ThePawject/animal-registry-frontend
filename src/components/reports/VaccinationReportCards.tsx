import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { FormField } from '../FormField'
import ReportCard from './ReportCard'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useExpiringVaccinationsReport,
  useVaccinationsReport,
} from '@/api/reports/queries'
import {
  createAndDownloadReport,
  genericErrorMessage,
  todayIsoDate,
} from '@/lib/utils'

const MAX_DAYS = 3650

export default function VaccinationReportCards() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState(todayIsoDate())
  const [days, setDays] = useState('30')
  const [includeExpired, setIncludeExpired] = useState(false)
  const [inShelterOnly, setInShelterOnly] = useState(true)

  const {
    mutate: getVaccinationsReport,
    isPending: isVaccinationsPending,
    error: vaccinationsError,
  } = useVaccinationsReport(({ blob, filename }) =>
    createAndDownloadReport(blob, filename),
  )
  const {
    mutate: getExpiringReport,
    isPending: isExpiringPending,
    error: expiringError,
  } = useExpiringVaccinationsReport(({ blob, filename }) =>
    createAndDownloadReport(blob, filename),
  )

  const expiresInDays = Number(days)
  const isRangeValid = Boolean(from) && Boolean(to) && from <= to
  const isDaysValid =
    days !== '' &&
    Number.isInteger(expiresInDays) &&
    expiresInDays >= 0 &&
    expiresInDays <= MAX_DAYS

  return (
    <>
      <ReportCard
        title="Szczepienia w okresie"
        description="Szczepienia podane w wybranym zakresie dat, włącznie z dniami granicznymi."
        onSubmit={() =>
          getVaccinationsReport({
            from: new Date(from).toISOString(),
            to: new Date(to).toISOString(),
          })
        }
        isPending={isVaccinationsPending}
        disabled={!isRangeValid}
        error={
          from && to && from > to
            ? 'Data początkowa nie może być późniejsza niż końcowa.'
            : vaccinationsError
              ? genericErrorMessage
              : null
        }
      >
        <FormField icon={Calendar} label="Data początkowa">
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            id="Data początkowa szczepień"
            className="bg-background"
          />
        </FormField>
        <FormField icon={Calendar} label="Data końcowa">
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            id="Data końcowa szczepień"
            className="bg-background"
          />
        </FormField>
      </ReportCard>

      <ReportCard
        title="Kończące się szczepienia"
        description="Szczepienia, których ważność kończy się w podanej liczbie dni."
        onSubmit={() =>
          getExpiringReport({
            expiresInDays,
            includeExpired,
            inShelterOnly,
          })
        }
        isPending={isExpiringPending}
        disabled={!isDaysValid}
        error={expiringError ? genericErrorMessage : null}
      >
        <FormField icon={Calendar} label="Wygasają w ciągu (dni)">
          <Input
            type="number"
            min={0}
            max={MAX_DAYS}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            id="Wygasają w ciągu"
            className="bg-background"
          />
        </FormField>
        <div className="flex items-center gap-2">
          <Checkbox
            id="report-include-expired"
            checked={includeExpired}
            onCheckedChange={(checked) => setIncludeExpired(checked === true)}
          />
          <Label htmlFor="report-include-expired">Uwzględnij już wygasłe</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="report-in-shelter-only"
            checked={inShelterOnly}
            onCheckedChange={(checked) => setInShelterOnly(checked === true)}
          />
          <Label htmlFor="report-in-shelter-only">
            Tylko zwierzęta w schronisku
          </Label>
        </div>
      </ReportCard>
    </>
  )
}
