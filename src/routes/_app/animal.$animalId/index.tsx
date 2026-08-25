import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import AnimalViewTab from '@/components/tabs/AnimalViewTab'

const parentRoute = getRouteApi('/_app/animal/$animalId')
export const Route = createFileRoute('/_app/animal/$animalId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { animal } = parentRoute.useLoaderData()

  return <AnimalViewTab animal={animal} />
}
