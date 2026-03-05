import { createFileRoute } from '@tanstack/react-router'
import AddAnimalForm from '@/components/AddAnimalForm'

export const Route = createFileRoute('/create/')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Dodaj zwierzę' }
  },
})

function RouteComponent() {
  return <AddAnimalForm />
}
