import { createFileRoute } from '@tanstack/react-router'
import AnimalTable from '@/components/AnimalTable'

export const Route = createFileRoute('/')({
  component: App,
  ssr: false,
})

function App() {
  const handleGetSelectedIds = (ids: Array<number>) => {
    console.log('Selected animal IDs for API call:', ids)
    // Here you would make your future API call
    alert(`Ready to send ${ids.length} animal IDs to API: ${ids.join(', ')}`)
  }

  return (
    <div className="container mx-auto py-12">
      <AnimalTable onGetSelectedIds={handleGetSelectedIds} />
    </div>
  )
}
