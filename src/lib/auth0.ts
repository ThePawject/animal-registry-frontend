import axios from 'axios'
import { Auth0Client } from '@auth0/auth0-spa-js'
import {
  decodeJwt,
  getRoles as extractRoles,
  getShelterName as extractShelterName,
  getAuthorizationParams,
} from './utils'
import type { GetTokenSilentlyOptions, User } from '@auth0/auth0-spa-js'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

type AuthStateListener = (state: AuthState) => void

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user?: User
  error?: Error
}

interface Auth0ManagerConfig {
  onAuthError?: () => void
}

class Auth0Manager {
  private client: Auth0Client
  private config: Auth0ManagerConfig = {}
  private requestInterceptorId: number | null = null
  private responseInterceptorId: number | null = null
  public apiClient: AxiosInstance
  private listeners: Set<AuthStateListener> = new Set()
  private state: AuthState = {
    isAuthenticated: false,
    isLoading: true,
  }
  private initPromise: Promise<void> | null = null

  constructor() {
    const env = import.meta.env as Record<string, string>

    this.client = new Auth0Client({
      domain: env.VITE_AUTH0_DOMAIN || '',
      clientId: env.VITE_AUTH0_CLIENT_ID || '',
      authorizationParams: {
        redirect_uri: env.VITE_AUTH0_REDIRECT_URI || '',
        ...getAuthorizationParams(),
      },
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
    })

    this.apiClient = axios.create({
      baseURL: env.VITE_BACKEND_URL,
      withCredentials: true,
    })

    this.setupInterceptors()
    this.initPromise = this.initializeAuth()
  }

  private async initializeAuth() {
    try {
      console.log('[AUTH0] Initializing auth...')

      const query = window.location.search
      if (query.includes('code=') && query.includes('state=')) {
        console.log('[AUTH0] Detected Auth0 callback, processing...')
        try {
          const result = await this.client.handleRedirectCallback()
          console.log('[AUTH0] Callback processed successfully:', result)

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          )
        } catch (error) {
          console.error('[AUTH0] Failed to handle callback:', error)
          throw error
        }
      }

      const isAuthenticated = await this.client.isAuthenticated()
      const user = isAuthenticated ? await this.client.getUser() : undefined

      console.log('[AUTH0] Initialized:', {
        isAuthenticated,
        user: user?.email,
      })

      this.updateState({
        isAuthenticated,
        isLoading: false,
        user,
      })
    } catch (error) {
      console.error('[AUTH0] Initialization error:', error)
      this.updateState({
        isAuthenticated: false,
        isLoading: false,
        error: error as Error,
      })
    }
  }

  async waitForInit(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise
    }
  }

  private updateState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState }
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state))
  }

  subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState(): AuthState {
    return this.state
  }

  setup(config: Auth0ManagerConfig) {
    this.config = { ...this.config, ...config }
  }

  private setupInterceptors() {
    this.requestInterceptorId = this.apiClient.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        await this.waitForInit()

        console.log(
          '[AUTH0] Request interceptor - isAuthenticated:',
          this.state.isAuthenticated,
        )

        if (!this.state.isAuthenticated) {
          console.log('[AUTH0] Not authenticated, skipping token')
          return config
        }

        try {
          console.log('[AUTH0] Attempting to get access token...')
          const token = await this.getAccessTokenSilently()
          console.log(
            '[AUTH0] Got token:',
            token ? `${token.substring(0, 20)}...` : 'null',
          )
          config.headers.Authorization = `Bearer ${token}`
        } catch (error) {
          console.error('[AUTH0] Failed to get token:', error)
          if (
            error instanceof Error &&
            error.message.includes('Missing Refresh Token')
          ) {
            this.config.onAuthError?.()
          } else if (
            error instanceof Error &&
            error.message.includes('Login required')
          ) {
            this.config.onAuthError?.()
          }
        }

        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      },
    )

    this.responseInterceptorId = this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.config.onAuthError?.()
        }
        return Promise.reject(error)
      },
    )
  }

  async getAccessTokenSilently(
    options?: GetTokenSilentlyOptions,
  ): Promise<string> {
    return this.client.getTokenSilently({
      authorizationParams: getAuthorizationParams(),
      ...options,
    })
  }

  async getRoles(): Promise<Array<string>> {
    try {
      const token = await this.getAccessTokenSilently()
      const decoded = decodeJwt(token)
      return decoded ? extractRoles(decoded) : []
    } catch (error) {
      console.error('Failed to get roles:', error)
      return []
    }
  }

  async getShelterName(): Promise<string | null> {
    try {
      const token = await this.getAccessTokenSilently()
      const decoded = decodeJwt(token)
      return decoded ? extractShelterName(decoded) : null
    } catch (error) {
      console.error('Failed to get shelter name:', error)
      return null
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return this.state.isAuthenticated
  }

  async getUser() {
    return this.state.user
  }

  async loginWithRedirect(options?: any) {
    return this.client.loginWithRedirect(options)
  }

  async logout(options?: any) {
    this.updateState({
      isAuthenticated: false,
      user: undefined,
    })
    return this.client.logout(options)
  }

  async handleRedirectCallback() {
    const result = await this.client.handleRedirectCallback()
    const isAuthenticated = await this.client.isAuthenticated()
    const user = isAuthenticated ? await this.client.getUser() : undefined

    this.updateState({
      isAuthenticated,
      user,
    })

    return result
  }

  destroy() {
    if (this.requestInterceptorId !== null) {
      this.apiClient.interceptors.request.eject(this.requestInterceptorId)
      this.requestInterceptorId = null
    }
    if (this.responseInterceptorId !== null) {
      this.apiClient.interceptors.response.eject(this.responseInterceptorId)
      this.responseInterceptorId = null
    }
  }
}

export const auth0Manager = new Auth0Manager()
export const apiClient = auth0Manager.apiClient
