import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import AnimalEventsTab from '@/components/tabs/AnimalEventsTab'
import { animalsKeys } from '@/api/animals/queries'
import { animalsService } from '@/api/animals/conversations'

export const Route = createFileRoute('/animal/$animalId/events/')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Wydarzenia' }
  },
})
const parentRoute = getRouteApi('/animal/$animalId')
function RouteComponent() {
  const { animal: animalFromLoader } = parentRoute.useLoaderData()
  const { data: animal } = useQuery({
    queryKey: animalsKeys.one(animalFromLoader.id),
    queryFn: () => animalsService.getAnimalById(animalFromLoader.id),
    initialData: animalFromLoader,
  })
  return <AnimalEventsTab animal={animal} />
}
