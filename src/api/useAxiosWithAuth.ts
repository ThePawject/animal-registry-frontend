import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import { getAuthorizationParams } from '@/lib/utils'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
})

type UseAxiosWithAuthProps = {
  setIsLoginModalOpen: (isOpen: boolean) => void
}

export const useAxiosWithAuth = ({
  setIsLoginModalOpen,
}: UseAxiosWithAuthProps) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  apiClient.interceptors.request.use(
    async (config) => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: getAuthorizationParams(),
          })
          config.headers.Authorization = `Bearer ${token}`
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes('Missing Refresh Token')
          ) {
            setIsLoginModalOpen(true)
          } else {
            console.error('Failed to get access token:', error)
          }
        }
      }
      return config
    },
    (error) => {
      console.error('Request error:', error)
      return Promise.reject(error)
    },
  )
}

export { apiClient }
