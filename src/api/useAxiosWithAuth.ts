import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import { getAuthorizationParams } from '@/lib/utils'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
})

export const useAxiosWithAuth = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  useEffect(() => {
    const interceptor = apiClient.interceptors.request.use(async (config) => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: getAuthorizationParams(),
          })
          config.headers.Authorization = `Bearer ${token}`
        } catch (error) {
          console.error('Failed to get access token:', error)
        }
      }
      return config
    })

    return () => {
      apiClient.interceptors.request.eject(interceptor)
    }
  }, [getAccessTokenSilently, isAuthenticated])

  return apiClient
}

export { apiClient }
