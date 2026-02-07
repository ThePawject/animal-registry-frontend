import { createFileRoute } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import AnimalTable from '@/components/AnimalTable'
import LoginPage from '@/components/LoginPage'
import Header from '@/components/Header'

export const Route = createFileRoute('/')({
  component: App,
  ssr: false,
})

function App() {
  const { isAuthenticated } = useAuth0()
  const handleGetSelectedIds = (ids: Array<number>) => {
    // Here you would make your future API call
    alert(`Ready to send ${ids.length} animal IDs to API: ${ids.join(', ')}`)
  }

  return (
    <div className="">
      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <div className="flex flex-col gap-16">
          <Header />
          <div className="container mx-auto">
            <AnimalTable onGetSelectedIds={handleGetSelectedIds} />
          </div>
        </div>
      )}
    </div>
  )
}
