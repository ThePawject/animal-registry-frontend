import { useSyncExternalStore } from 'react'
import type { User } from '@auth0/auth0-spa-js'
import { auth0Manager } from '@/lib/auth0'

interface UseAuthReturn {
  isAuthenticated: boolean
  isLoading: boolean
  user?: User
  error?: Error
  loginWithRedirect: (options?: any) => Promise<void>
  logout: (options?: any) => Promise<void>
  getAccessTokenSilently: (options?: any) => Promise<string>
}

export function useAuth(): UseAuthReturn {
  const state = useSyncExternalStore(
    (callback) => auth0Manager.subscribe(callback),
    () => auth0Manager.getState(),
    () => auth0Manager.getState(),
  )

  return {
    ...state,
    loginWithRedirect: (options?: any) =>
      auth0Manager.loginWithRedirect(options),
    logout: (options?: any) => auth0Manager.logout(options),
    getAccessTokenSilently: (options?: any) =>
      auth0Manager.getAccessTokenSilently(options),
  }
}
