import { createFileRoute } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import AnimalTable from '@/components/AnimalTable'
import LoginPage from '@/components/LoginPage'
import Header from '@/components/Header'
import { useUserInfo } from '@/hooks/useUserInfo'
import LoginModal from '@/components/LoginModal'
import { NoAccess } from '@/components/NoAccess'
import { getAuthorizationParams } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: App,
  ssr: false,
})

function App() {
  const { isAuthenticated, getAccessTokenWithPopup, isLoading } = useAuth0()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [roles, setRoles] = useState<Array<string>>([])
  const handleGetSelectedIds = (ids: Array<number>) => {
    // Here you would make your future API call
    alert(`Ready to send ${ids.length} animal IDs to API: ${ids.join(', ')}`)
  }

  const { shelterName, isLoadingRoles } = useUserInfo({
    setIsLoginModalOpen,
    setRoles,
  })

  const userHasNoRoles = !isLoadingRoles && roles.length === 0

  return (
    <div className="">
      {!isAuthenticated ? (
        <LoginPage />
      ) : userHasNoRoles ? (
        <NoAccess />
      ) : (
        <div className="flex flex-col gap-16">
          <Header shelterName={shelterName} />
          <div className="container mx-auto">
            <AnimalTable onGetSelectedIds={handleGetSelectedIds} />
          </div>
        </div>
      )}
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onClick={() => {
          getAccessTokenWithPopup({
            authorizationParams: getAuthorizationParams(),
          }).then(() => setIsLoginModalOpen(false))
        }}
        loading={isLoading}
      />
    </div>
  )
}
