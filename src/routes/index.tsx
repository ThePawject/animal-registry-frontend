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
import { useAxiosWithAuth } from '@/api/useAxiosWithAuth'

export const Route = createFileRoute('/')({
  component: App,
  ssr: false,
})

function App() {
  const { isAuthenticated, getAccessTokenWithPopup, isLoading } = useAuth0()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [roles, setRoles] = useState<Array<string>>([])

  const { shelterName, isLoadingRoles } = useUserInfo({
    setIsLoginModalOpen,
    isLoginModalOpen,
    setRoles,
  })
  useAxiosWithAuth({ setIsLoginModalOpen })

  const showNoAccessPage =
    !isLoadingRoles && roles.length === 0 && !isLoginModalOpen && !isLoading

  return (
    <div className="">
      {!isAuthenticated ? (
        <LoginPage />
      ) : showNoAccessPage ? (
        <NoAccess />
      ) : (
        <div className="flex flex-col gap-16">
          <Header shelterName={shelterName} />
          <div className="container mx-auto">
            <AnimalTable />
          </div>
        </div>
      )}
      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
        onClick={() => {
          getAccessTokenWithPopup({
            authorizationParams: getAuthorizationParams(),
          }).then((test) => {
            console.log('response', test)
            setIsLoginModalOpen(false)
          })
        }}
        loading={isLoading}
      />
    </div>
  )
}
