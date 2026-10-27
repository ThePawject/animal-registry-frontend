import { createFileRoute } from '@tanstack/react-router'
import ExpiringVaccinations from '@/components/ExpiringVaccinations'

export const Route = createFileRoute('/_app/vaccinations')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Szczepienia', hideBreadcrumbs: true }
  },
})

function RouteComponent() {
  return <ExpiringVaccinations />
}
