import { createFileRoute } from '@tanstack/react-router'
import type { ReportTab } from '@/components/Reports'
import Reports, { REPORT_TABS } from '@/components/Reports'

export type ReportsSearch = {
  tab?: ReportTab
}

export const Route = createFileRoute('/_app/reports')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ReportsSearch => ({
    tab: REPORT_TABS.find(({ value }) => value === search.tab)?.value,
  }),
  loader: () => {
    return { title: 'Raporty' }
  },
})

function RouteComponent() {
  return <Reports />
}
