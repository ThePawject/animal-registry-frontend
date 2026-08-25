import { createFileRoute } from '@tanstack/react-router'
import AddAnimalForm from '@/components/AddAnimalForm'

export const Route = createFileRoute('/_app/create/')({
  component: RouteComponent,
  loader: () => {
    return { title: 'Dodaj zwierzę' }
  },
})

function RouteComponent() {
  return <AddAnimalForm />
}
