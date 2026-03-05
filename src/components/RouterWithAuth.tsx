import { useAuth0 } from '@auth0/auth0-react'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from '@/router'
import { getAuthorizationParams } from '@/lib/utils'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const router = getRouter()
export function RouterWithAuth() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()

  return (
    <RouterProvider
      router={router}
      context={{
        isAuthenticated,
        getAccessToken: () =>
          getAccessTokenSilently({
            authorizationParams: getAuthorizationParams(),
          }),
      }}
    />
  )
}
