import { useState } from 'react'
import {
  Building2Icon,
  CalendarDaysIcon,
  PawPrintIcon,
  SyringeIcon,
} from 'lucide-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import AnimalsDumpReportCard from './reports/AnimalsDumpReportCard'
import DateRangeReportCard from './reports/DateRangeReportCard'
import EventReportCard from './reports/EventReportCard'
import OriginReportCards from './reports/OriginReportCards'
import SelectedAnimalsReportCard from './reports/SelectedAnimalsReportCard'
import VaccinationReportCards from './reports/VaccinationReportCards'
import type { SelectedAnimals } from './modals/SelectAnimalsModal'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFeature } from '@/api/features/queries'

export const REPORT_TABS = [
  { value: 'zwierzeta', label: 'Zwierzęta', icon: PawPrintIcon },
  { value: 'zdarzenia', label: 'Zdarzenia', icon: CalendarDaysIcon },
  { value: 'szczepienia', label: 'Szczepienia', icon: SyringeIcon },
  { value: 'pochodzenie', label: 'Pochodzenie', icon: Building2Icon },
] as const satisfies ReadonlyArray<{
  value: string
  label: string
  icon: LucideIcon
}>

export type ReportTab = (typeof REPORT_TABS)[number]['value']

const routeApi = getRouteApi('/_app/reports')

function ReportsGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>
}

export default function Reports() {
  const { tab } = routeApi.useSearch()
  const navigate = useNavigate({ from: '/reports' })
  const { isEnabled: isOriginEnabled } = useFeature('animal-origin')
  const { isEnabled: isVaccinationsEnabled } = useFeature('animal-vaccinations')
  // Kept here because the tab content unmounts when another tab is open.
  const [selectedAnimals, setSelectedAnimals] = useState<SelectedAnimals>(
    new Map(),
  )

  const availableTabs = REPORT_TABS.filter(
    ({ value }) =>
      (value !== 'szczepienia' || isVaccinationsEnabled) &&
      (value !== 'pochodzenie' || isOriginEnabled),
  )
  const activeTab =
    availableTabs.find(({ value }) => value === tab)?.value ?? 'zwierzeta'

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) =>
        navigate({
          search: { tab: value as ReportTab },
          replace: true,
        })
      }
      className="gap-6 px-8 md:px-0 pb-8"
    >
      <TabsList className="h-auto flex-wrap justify-start">
        {availableTabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex-none px-4 py-1.5 text-base"
          >
            <Icon />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="zwierzeta">
        <ReportsGrid>
          <AnimalsDumpReportCard />
          <SelectedAnimalsReportCard
            selected={selectedAnimals}
            onSelectedChange={setSelectedAnimals}
          />
        </ReportsGrid>
      </TabsContent>
      <TabsContent value="zdarzenia">
        <ReportsGrid>
          <EventReportCard />
          <DateRangeReportCard />
        </ReportsGrid>
      </TabsContent>
      {isVaccinationsEnabled && (
        <TabsContent value="szczepienia">
          <ReportsGrid>
            <VaccinationReportCards />
          </ReportsGrid>
        </TabsContent>
      )}
      {isOriginEnabled && (
        <TabsContent value="pochodzenie">
          <ReportsGrid>
            <OriginReportCards />
          </ReportsGrid>
        </TabsContent>
      )}
    </Tabs>
  )
}
