import { Outlet, createFileRoute } from '@tanstack/react-router'
import { animalsService } from '@/api/animals/conversations'
import { animalsKeys } from '@/api/animals/queries'

export const Route = createFileRoute('/animal/$animalId')({
  component: RouteComponent,
  loader: async ({ params, context }) => {
    const token = await context.getAccessToken()
    const animal = await context.queryClient.fetchQuery({
      queryKey: animalsKeys.one(params.animalId),
      queryFn: async () => {
        const data = await animalsService.getAnimalById(params.animalId, token)
        return data
      },
    })
    return { animal, title: animal.name || 'Szczegóły zwierzęcia' }
  },
})

function RouteComponent() {
  return <Outlet />
}
