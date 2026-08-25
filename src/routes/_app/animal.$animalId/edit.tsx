import { createFileRoute } from '@tanstack/react-router'
import { AnimalEditTab } from '@/components/tabs/AnimalEditTab'

export const Route = createFileRoute('/_app/animal/$animalId/edit')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Edycja zwierzęcia' }
  },
})

function RouteComponent() {
  const { animal } = Route.parentRoute.useLoaderData()
  return <AnimalEditTab animal={animal} />
}
