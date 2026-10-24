import AnimalsDumpReportCard from './reports/AnimalsDumpReportCard'
import DateRangeReportCard from './reports/DateRangeReportCard'
import EventReportCard from './reports/EventReportCard'
import OriginReportCards from './reports/OriginReportCards'
import SelectedAnimalsReportCard from './reports/SelectedAnimalsReportCard'
import VaccinationReportCards from './reports/VaccinationReportCards'
import type { ReactNode } from 'react'
import { useFeature } from '@/api/features/queries'

function ReportsSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">{children}</div>
    </section>
  )
}

export default function Reports() {
  const { isEnabled: isOriginEnabled } = useFeature('animal-origin')
  const { isEnabled: isVaccinationsEnabled } = useFeature('animal-vaccinations')

  return (
    <div className="flex flex-col gap-8 px-8 md:px-0 pb-8">
      <ReportsSection title="Zwierzęta">
        <AnimalsDumpReportCard />
        <SelectedAnimalsReportCard />
      </ReportsSection>
      <ReportsSection title="Zdarzenia">
        <EventReportCard />
        <DateRangeReportCard />
      </ReportsSection>
      {isVaccinationsEnabled && (
        <ReportsSection title="Szczepienia">
          <VaccinationReportCards />
        </ReportsSection>
      )}
      {isOriginEnabled && (
        <ReportsSection title="Pochodzenie">
          <OriginReportCards />
        </ReportsSection>
      )}
    </div>
  )
}
