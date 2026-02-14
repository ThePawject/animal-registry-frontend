import { createFileRoute } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import AnimalTable from '@/components/AnimalTable'
import Header from '@/components/Header'
import { useUserInfo } from '@/hooks/useUserInfo'
import { AuthTransition } from '@/components/AuthTransition'
import LoginModal from '@/components/LoginModal'
import { getAuthorizationParams } from '@/lib/utils'
import { useAxiosWithAuth } from '@/api/useAxiosWithAuth'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { isLoading, getAccessTokenWithPopup } = useAuth0()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [roles, setRoles] = useState<Array<string>>([])
  const queryClient = useQueryClient()

  const { shelterName, isLoadingRoles } = useUserInfo({
    setIsLoginModalOpen,
    isLoginModalOpen,
    setRoles,
  })
  useAxiosWithAuth({ setIsLoginModalOpen })

  const userHasNoRoles = isLoadingRoles || roles.length === 0
  return (
    <>
      <AuthTransition
        userHasNoRoles={userHasNoRoles}
        authenticatedComponent={
          <>
            {!userHasNoRoles && (
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
                }).then(() => {
                  queryClient.invalidateQueries()
                  setIsLoginModalOpen(false)
                })
              }}
              loading={isLoading}
            />
          </>
        }
      />
    </>
  )
}
