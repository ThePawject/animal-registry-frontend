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
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  useEffect(() => {
    if (!isAuthenticated) {
      setShelterName(null)
      return
    }
    ;(async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: getAuthorizationParams(),
        })
        setShelterName(getShelterName(decodeJwt(token || '')))
        const roles = getRoles(decodeJwt(token || ''))
        setRoles(roles)
      } catch (e) {
        if (e instanceof Error) {
          if (e.message.includes('Missing Refresh Token')) {
            setIsLoginModalOpen(true)
          }
        } else {
          console.error('Unexpected error:', e)
        }
      }
    })()
  }, [getAccessTokenSilently, isAuthenticated])
  return { shelterName }
}
