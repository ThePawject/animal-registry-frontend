import { createFileRoute } from '@tanstack/react-router'
import AnimalTable from '@/components/AnimalTable'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return <AnimalTable />
}
