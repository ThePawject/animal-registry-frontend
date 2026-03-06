import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import AnimalViewTab from '@/components/tabs/AnimalViewTab'

const parentRoute = getRouteApi('/animal/$animalId')
export const Route = createFileRoute('/animal/$animalId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { animal } = parentRoute.useLoaderData()

  return <AnimalViewTab animal={animal} />
}
