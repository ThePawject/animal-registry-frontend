import { createAuth0Client } from '@auth0/auth0-spa-js'

export const auth0 = createAuth0Client({
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  authorizationParams: {
    redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || '',
  },
  useRefreshTokens: true,
  cacheLocation: 'localstorage',
})
