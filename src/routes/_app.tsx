import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { useAxiosWithAuth } from '@/api/useAxiosWithAuth'
import { useUserInfo } from '@/hooks/useUserInfo'
import Header from '@/components/Header'
import { AuthTransition } from '@/components/AuthTransition'
import LoginModal from '@/components/LoginModal'
import { getAuthorizationParams } from '@/lib/utils'
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
            <div className="flex flex-col gap-8">
              <Header shelterName={shelterName} />
              <div className="container mx-auto flex flex-col gap-8">
                <Breadcrumbs />
                <Outlet />
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
  )
}
