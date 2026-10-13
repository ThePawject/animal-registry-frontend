import { createFileRoute } from '@tanstack/react-router'
import UserGuide from '@/components/UserGuide'

export const Route = createFileRoute('/_app/guide')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Przewodnik' }
  },
})

function RouteComponent() {
  return <UserGuide />
}
