import { createFileRoute } from '@tanstack/react-router'
import Reports from '@/components/Reports'

export const Route = createFileRoute('/_app/reports')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Raporty' }
  },
})

function RouteComponent() {
  return <Reports />
}
