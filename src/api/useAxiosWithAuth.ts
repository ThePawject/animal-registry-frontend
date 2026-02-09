import { useEffect } from 'react'
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

  useEffect(() => {
    let isRefreshing = false
    let refreshPromise: Promise<string> | null = null

    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        if (isAuthenticated) {
          try {
            const token = await getAccessTokenSilently({
              authorizationParams: getAuthorizationParams(),
            })
            config.headers.Authorization = `Bearer ${token}`
          } catch (error) {
            if (error instanceof Error) {
              if (error.message.includes('Missing Refresh Token')) {
                setIsLoginModalOpen(true)
              }
            } else {
              console.error('Failed to get access token:', error)
            }
          }
        }
        return config
      },
    )

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          isAuthenticated
        ) {
          originalRequest._retry = true

          if (!isRefreshing) {
            isRefreshing = true
            refreshPromise = getAccessTokenSilently({
              authorizationParams: getAuthorizationParams(),
            })
          }

          try {
            const newToken = await refreshPromise
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return apiClient(originalRequest)
          } catch (refreshError) {
            if (refreshError instanceof Error) {
              if (refreshError.message.includes('Missing Refresh Token')) {
                setIsLoginModalOpen(true)
              }
            }
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
            refreshPromise = null
          }
        }

        return Promise.reject(error)
      },
    )

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor)
      apiClient.interceptors.response.eject(responseInterceptor)
    }
  }, [getAccessTokenSilently, isAuthenticated])

  return apiClient
}

export { apiClient }
