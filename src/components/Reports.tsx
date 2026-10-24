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
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useShelterFeatures } from '@/api/features/queries'

export const REPORT_TABS = [
  { value: 'zwierzeta', label: 'Zwierzęta', icon: PawPrintIcon },
  { value: 'zdarzenia', label: 'Zdarzenia', icon: CalendarDaysIcon },
  {
    value: 'szczepienia',
    label: 'Szczepienia',
    icon: SyringeIcon,
    feature: 'animal-vaccinations',
  },
  {
    value: 'pochodzenie',
    label: 'Pochodzenie',
    icon: Building2Icon,
    feature: 'animal-origin',
  },
] as const satisfies ReadonlyArray<{
  value: string
  label: string
  icon: LucideIcon
  feature?: string
}>

export type ReportTab = (typeof REPORT_TABS)[number]['value']

const routeApi = getRouteApi('/_app/reports')

function ReportsGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>
}

export default function Reports() {
  const { tab } = routeApi.useSearch()
  const navigate = useNavigate({ from: '/reports' })
  const { data: features, isLoading } = useShelterFeatures()
  // Kept here because the tab content unmounts when another tab is open.
  const [selectedAnimals, setSelectedAnimals] = useState<SelectedAnimals>(
    new Map(),
  )

  // Until the addon settings arrive, an addon tab asked for in the URL
  // cannot be told apart from a disabled one.
  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  const availableTabs = REPORT_TABS.filter(
    (reportTab) =>
      !('feature' in reportTab) ||
      features?.some(
        ({ key, isEnabled }) => key === reportTab.feature && isEnabled,
      ),
  )
  const activeTab =
    availableTabs.find(({ value }) => value === tab)?.value ?? 'zwierzeta'

  const tabContent: Record<ReportTab, ReactNode> = {
    zwierzeta: (
      <>
        <AnimalsDumpReportCard />
        <SelectedAnimalsReportCard
          selected={selectedAnimals}
          onSelectedChange={setSelectedAnimals}
        />
      </>
    ),
    zdarzenia: (
      <>
        <EventReportCard />
        <DateRangeReportCard />
      </>
    ),
    szczepienia: <VaccinationReportCards />,
    pochodzenie: <OriginReportCards />,
  }

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
      {availableTabs.map(({ value }) => (
        <TabsContent key={value} value={value}>
          <ReportsGrid>{tabContent[value]}</ReportsGrid>
        </TabsContent>
      ))}
    </Tabs>
  )
}
