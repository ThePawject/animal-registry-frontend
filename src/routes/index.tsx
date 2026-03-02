import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import AnimalTable from '@/components/AnimalTable'
import Header from '@/components/Header'
import { useUserInfo } from '@/hooks/useUserInfo'
import { AuthTransition } from '@/components/AuthTransition'
import LoginModal from '@/components/LoginModal'
import { getAuthorizationParams } from '@/lib/utils'
import { auth0Manager } from '@/lib/auth0'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { isLoading, getAccessTokenSilently, isAuthenticated } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [roles, setRoles] = useState<Array<string>>([])
  const queryClient = useQueryClient()

  const { shelterName, isLoadingRoles } = useUserInfo({
    setIsLoginModalOpen,
    isLoginModalOpen,
    setRoles,
  })

  useEffect(() => {
    auth0Manager.setup({
      onAuthError: () => setIsLoginModalOpen(true),
    })
  }, [])

  const userHasNoRoles =
    isAuthenticated && (isLoadingRoles || roles.length === 0)

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
                getAccessTokenSilently({
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
