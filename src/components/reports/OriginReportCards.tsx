import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { FormField } from '../FormField'
import ReportCard from './ReportCard'
import { Input } from '@/components/ui/input'
import {
  useOriginMonthlyReport,
  useOriginYearlyReport,
} from '@/api/reports/queries'
import { createAndDownloadReport, genericErrorMessage } from '@/lib/utils'

const MIN_YEAR = 2000
const MAX_YEAR = 2100

const getDefaultMonth = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${month}`
}

export default function OriginReportCards() {
  const [month, setMonth] = useState(getDefaultMonth())
  const [year, setYear] = useState(String(new Date().getFullYear()))

  const {
    mutate: getMonthlyReport,
    isPending: isMonthlyPending,
    error: monthlyError,
  } = useOriginMonthlyReport(({ blob, filename }) =>
    createAndDownloadReport(blob, filename),
  )
  const {
    mutate: getYearlyReport,
    isPending: isYearlyPending,
    error: yearlyError,
  } = useOriginYearlyReport(({ blob, filename }) =>
    createAndDownloadReport(blob, filename),
  )

  const [monthlyYear, monthlyMonth] = month.split('-').map(Number)
  const yearlyYear = Number(year)
  const isMonthlyValid =
    monthlyYear >= MIN_YEAR && monthlyYear <= MAX_YEAR && monthlyMonth >= 1
  const isYearlyValid =
    Number.isInteger(yearlyYear) &&
    yearlyYear >= MIN_YEAR &&
    yearlyYear <= MAX_YEAR

  return (
    <>
      <ReportCard
        title="Zestawienie miesięczne"
        description="Zwierzęta przyjęte w wybranym miesiącu, pogrupowane według gminy zlecającej."
        onSubmit={() =>
          getMonthlyReport({ year: monthlyYear, month: monthlyMonth })
        }
        isPending={isMonthlyPending}
        disabled={!isMonthlyValid}
        error={monthlyError ? genericErrorMessage : null}
      >
        <FormField icon={Calendar} label="Miesiąc">
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            id="Miesiąc"
            className="bg-background"
          />
        </FormField>
      </ReportCard>

      <ReportCard
        title="Zestawienie roczne"
        description="Liczba przyjętych zwierząt w każdym miesiącu, według gminy zlecającej."
        onSubmit={() => getYearlyReport({ year: yearlyYear })}
        isPending={isYearlyPending}
        disabled={!isYearlyValid}
        error={yearlyError ? genericErrorMessage : null}
      >
        <FormField icon={Calendar} label="Rok">
          <Input
            type="number"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            id="Rok"
            className="bg-background"
          />
        </FormField>
      </ReportCard>
    </>
  )
}
