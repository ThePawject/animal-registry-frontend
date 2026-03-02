import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { auth0Manager } from '@/lib/auth0'

type UseUserInfoProps = {
  setIsLoginModalOpen: (isOpen: boolean) => void
  setRoles: (roles: Array<string>) => void
  isLoginModalOpen: boolean
}

export function useUserInfo({
  setIsLoginModalOpen,
  setRoles,
  isLoginModalOpen,
}: UseUserInfoProps) {
  const [shelterName, setShelterName] = useState<string | null>(null)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      setShelterName(null)
      setRoles([])
      setIsLoadingRoles(false)
      return
    }

    const loadUserInfo = async () => {
      try {
        setIsLoadingRoles(true)

        const [name, userRoles] = await Promise.all([
          auth0Manager.getShelterName(),
          auth0Manager.getRoles(),
        ])

        setShelterName(name)
        setRoles(userRoles)
        setIsLoadingRoles(false)
      } catch (e) {
        setIsLoadingRoles(false)
        setRoles([])
        if (e instanceof Error && e.message.includes('Missing Refresh Token')) {
          localStorage.clear()
          window.location.reload()
        } else if (e instanceof Error && e.message.includes('Login required')) {
          setIsLoginModalOpen(true)
        } else {
          console.error('Unexpected error:', e)
        }
      }
    }

    loadUserInfo()
  }, [
    isAuthenticated,
    isLoading,
    isLoginModalOpen,
    setIsLoginModalOpen,
    setRoles,
  ])

  return { shelterName, isLoadingRoles }
}
