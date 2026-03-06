import { useQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { animalsService } from '@/api/animals/conversations'
import { animalsKeys } from '@/api/animals/queries'
import AnimalHealthRecordsTab from '@/components/tabs/AnimalHealthRecordsTab'

export const Route = createFileRoute('/animal/$animalId/medical-records/')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Medyczne' }
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
  return <AnimalHealthRecordsTab animal={animal} />
}
