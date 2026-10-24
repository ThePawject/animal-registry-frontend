import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useAxiosWithAuth } from '@/api/useAxiosWithAuth'
import { RolesContext } from '@/hooks/RolesContext'
import { useUserInfo } from '@/hooks/useUserInfo'
import Header from '@/components/Header'
import { AuthTransition } from '@/components/AuthTransition'
import LoginModal from '@/components/LoginModal'
import { getAuthorizationParams } from '@/lib/utils'
import { APP_SCROLL_CONTAINER_ID } from '@/lib/navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const Route = createFileRoute('/_app')({
  component: AppLayout,

  loader: () => ({
    title: 'Lista Zwierząt',
    href: '/panel',
  }),
})

function AppLayout() {
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

  const userHasNoRoles = !isLoadingRoles && roles.length === 0

  return (
    <AuthTransition
      userHasNoRoles={userHasNoRoles}
      isLoginModalOpen={isLoginModalOpen}
      authenticatedComponent={
        <>
          {!userHasNoRoles && (
            <RolesContext.Provider value={roles}>
              <div className="flex h-dvh flex-col print:h-auto">
                <Header shelterName={shelterName} />
                <main
                  id={APP_SCROLL_CONTAINER_ID}
                  className="relative flex-1 overflow-y-auto [scrollbar-gutter:stable] print:overflow-visible"
                >
                  <div className="container mx-auto flex flex-col gap-8 pt-8">
                    <Breadcrumbs />
                    <Outlet />
                  </div>
                </main>
              </div>
            </RolesContext.Provider>
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
  )
}
