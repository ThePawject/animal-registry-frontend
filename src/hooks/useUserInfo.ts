import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import {
  decodeJwt,
  getAuthorizationParams,
  getRoles,
  getShelterName,
} from '@/lib/utils'

type UseUserInfoProps = {
  setIsLoginModalOpen: (isOpen: boolean) => void
  setRoles: (roles: Array<string>) => void
}

export function useUserInfo({
  setIsLoginModalOpen,
  setRoles,
}: UseUserInfoProps) {
  const [shelterName, setShelterName] = useState<string | null>(null)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0()
  useEffect(() => {
    if (!isAuthenticated) {
      setShelterName(null)
      return
    }
    ;(async () => {
      try {
        setIsLoadingRoles(true)
        const token = await getAccessTokenSilently({
          authorizationParams: getAuthorizationParams(),
        })
        setShelterName(getShelterName(decodeJwt(token || '')))
        const roles = getRoles(decodeJwt(token || ''))
        setRoles(roles)
        setIsLoadingRoles(false)
      } catch (e) {
        setIsLoadingRoles(false)
        if (e instanceof Error) {
          if (e.message.includes('Missing Refresh Token')) {
            setIsLoginModalOpen(true)
          }
        } else {
          console.error('Unexpected error:', e)
        }
      }
    })()
  }, [getAccessTokenSilently, isAuthenticated, isLoading])
  return { shelterName, isLoadingRoles }
}
