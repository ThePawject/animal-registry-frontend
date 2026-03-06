import { Auth0Provider } from '@auth0/auth0-react'

export const OurAuth0Provider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN || ''}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || ''}
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI || '',
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  )
}
