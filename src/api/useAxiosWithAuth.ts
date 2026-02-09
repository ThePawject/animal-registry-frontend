import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'
import { getAuthorizationParams } from '@/lib/utils'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
})

// Shared mutable context that interceptors can access
const authContext: {
  getAccessTokenSilently:
    | ((options?: {
        authorizationParams?: Record<string, unknown>
      }) => Promise<string>)
    | null
  setIsLoginModalOpen: ((isOpen: boolean) => void) | null
  isAuthenticated: boolean
  isRefreshing: boolean
  refreshPromise: Promise<string> | null
} = {
  getAccessTokenSilently: null,
  setIsLoginModalOpen: null,
  isAuthenticated: false,
  isRefreshing: false,
  refreshPromise: null,
}

// Request interceptor - adds auth header
apiClient.interceptors.request.use(
  async (config) => {
    console.log('Request interceptor:', config.url)

    if (authContext.isAuthenticated && authContext.getAccessTokenSilently) {
      try {
        const token = await authContext.getAccessTokenSilently({
          authorizationParams: getAuthorizationParams(),
        })
        config.headers.Authorization = `Bearer ${token}`
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Missing Refresh Token')
        ) {
          authContext.setIsLoginModalOpen?.(true)
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

// Response interceptor - handles 401s and token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response interceptor:', response.config.url, response.status)
    return response
  },
  async (error) => {
    console.log(
      'Response error interceptor:',
      error.response?.status,
      error.config?.url,
    )

    const originalRequest = error.config

    // Check if it's a 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      console.log('401 detected, attempting token refresh...')

      // If not already refreshing, start a new refresh
      console.log('silently', authContext.getAccessTokenSilently)
      authContext.isRefreshing = true
      authContext.refreshPromise =
        authContext.getAccessTokenSilently?.({
          authorizationParams: getAuthorizationParams(),
        }) ?? null
      console.log('authContext:', {
        isRefreshing: authContext.isRefreshing,
        hasRefreshPromise: authContext.refreshPromise,
      })

      try {
        const newToken = await authContext.refreshPromise
        if (!newToken) {
          throw new Error('Failed to refresh token')
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        console.log('Token refreshed, retrying request...')
        return apiClient(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)

        if (
          refreshError instanceof Error &&
          refreshError.message.includes('Missing Refresh Token')
        ) {
          authContext.setIsLoginModalOpen?.(true)
        }
        return Promise.reject(refreshError)
      } finally {
        authContext.isRefreshing = false
        authContext.refreshPromise = null
      }
    }

    return Promise.reject(error)
  },
)

type UseAxiosWithAuthProps = {
  setIsLoginModalOpen: (isOpen: boolean) => void
}

export const useAxiosWithAuth = ({
  setIsLoginModalOpen,
}: UseAxiosWithAuthProps) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  // Update the shared context synchronously during render
  // This runs BEFORE children render, ensuring auth is ready
  authContext.getAccessTokenSilently = getAccessTokenSilently
  authContext.setIsLoginModalOpen = setIsLoginModalOpen
  authContext.isAuthenticated = isAuthenticated

  return apiClient
}

export { apiClient }
