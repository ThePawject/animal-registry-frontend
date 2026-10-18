import { useQuery } from '@tanstack/react-query'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { animalsService } from '@/api/animals/conversations'
import { animalsKeys } from '@/api/animals/queries'
import AnimalVaccinationsTab from '@/components/tabs/AnimalVaccinationsTab'

export const Route = createFileRoute('/_app/animal/$animalId/vaccinations/')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Szczepienia' }
  },
})

const parentRoute = getRouteApi('/_app/animal/$animalId')
function RouteComponent() {
  const { animal: animalFromLoader } = parentRoute.useLoaderData()
  const { data: animal } = useQuery({
    queryKey: animalsKeys.one(animalFromLoader.id),
    queryFn: () => animalsService.getAnimalById(animalFromLoader.id),
    initialData: animalFromLoader,
  })
  return <AnimalVaccinationsTab animal={animal} />
}
